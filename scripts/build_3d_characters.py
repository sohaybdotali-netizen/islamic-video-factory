import bpy, math, os
from mathutils import Vector

# Generates two reusable rigged cartoon GLB characters for the Remotion scene.
# Run from repository root: blender --background --python scripts/build_3d_characters.py

def mat(name, color, rough=0.75, metal=0.0):
    m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=(*color,1); p.inputs['Roughness'].default_value=rough; p.inputs['Metallic'].default_value=metal
    return m

def sphere(name, loc, scale, material, bone):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=20, location=loc)
    o=bpy.context.object; o.name=name; o.scale=scale; bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(material)
    for f in o.data.polygons: f.use_smooth=True
    o.parent=rig; o.parent_type='BONE'; o.parent_bone=bone; o.matrix_parent_inverse=rig.matrix_world.inverted()
    return o

def rod(name, a, b, radius, material, bone):
    d=Vector(b)-Vector(a); mid=(Vector(a)+Vector(b))/2
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=radius, depth=d.length, location=mid)
    o=bpy.context.object; o.name=name; o.rotation_mode='QUATERNION'; o.rotation_quaternion=d.to_track_quat('Z','Y'); o.data.materials.append(material)
    bevel=o.modifiers.new('Soft edges','BEVEL'); bevel.width=.055; bevel.segments=3; o.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
    o.parent=rig; o.parent_type='BONE'; o.parent_bone=bone; o.matrix_parent_inverse=rig.matrix_world.inverted()
    return o

def build(role):
    global rig
    bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
    teacher=role=='ustad'
    skin=mat('Warm skin',(0.48,.26,.16)); cloth=mat('Forest green robe',(.025,.16,.105)) if teacher else mat('Ivory kurta',(.82,.78,.67))
    vest=mat('Green waistcoat',(.025,.24,.15)); white=mat('White headwear',(.94,.92,.84)); beard=mat('Dark beard',(.075,.035,.02)); dark=mat('Eyes',(.012,.009,.007)); gold=mat('Gold trim',(.68,.46,.16),.4,.35)
    ad=bpy.data.armatures.new(role+'_Armature'); rig=bpy.data.objects.new(role+'_Rig',ad); bpy.context.collection.objects.link(rig); bpy.context.view_layer.objects.active=rig; rig.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    bones={'Root':((0,0,0),(0,0,.3),None),'Spine':((0,0,.3),(0,0,1.65),'Root'),'Head':((0,0,1.65),(0,0,2.45),'Spine'),'Arm.L':((-.4,0,1.45),(-.78,0,.8),'Spine'),'Arm.R':((.4,0,1.45),(.78,0,.8),'Spine'),'Forearm.L':((-.78,0,.8),(-.82,0,.35),'Arm.L'),'Forearm.R':((.78,0,.8),(.82,0,.35),'Arm.R')}
    for n,(h,t,p) in bones.items():
        b=ad.edit_bones.new(n); b.head=h; b.tail=t
        if p: b.parent=ad.edit_bones[p]
    bpy.ops.object.mode_set(mode='OBJECT'); rig.select_set(False)
    sphere('Long robe body',(0,0,1.02),(.57,.34,.82),cloth,'Spine')
    if not teacher: sphere('Waistcoat',(0,-.285,1.08),(.37,.09,.53),vest,'Spine')
    sphere('Neck',(0,0,1.68),(.18,.18,.22),skin,'Head'); sphere('Face',(0,-.015,2.02),(.42,.35,.49),skin,'Head')
    for x in (-.42,.42): sphere('Ear',(x,-.01,2.02),(.09,.11,.14),skin,'Head')
    for x in (-.155,.155):
        sphere('Eye',(x,-.34,2.11),(.052,.026,.067),white,'Head'); sphere('Pupil',(x,-.365,2.11),(.024,.014,.038),dark,'Head'); sphere('Eyebrow',(x,-.335,2.22),(.085,.025,.022),beard,'Head')
    sphere('Nose',(0,-.37,1.99),(.065,.07,.10),skin,'Head')
    if teacher:
        sphere('Beard',(0,-.27,1.77),(.29,.18,.29),beard,'Head'); sphere('Moustache',(0,-.39,1.91),(.17,.055,.06),beard,'Head')
        sphere('White turban',(0,0,2.46),(.47,.38,.23),white,'Head'); sphere('Turban fold',(0,-.30,2.47),(.27,.07,.09),white,'Head'); sphere('Gold turban detail',(0,-.365,2.42),(.25,.025,.025),gold,'Head')
        for x in (-.155,.155):
            bpy.ops.mesh.primitive_torus_add(major_radius=.095,minor_radius=.012,major_segments=24,minor_segments=8,location=(x,-.385,2.11),rotation=(math.pi/2,0,0)); o=bpy.context.object; o.name='Spectacles'; o.data.materials.append(gold); o.parent=rig; o.parent_type='BONE'; o.parent_bone='Head'; o.matrix_parent_inverse=rig.matrix_world.inverted()
    else:
        sphere('White prayer cap',(0,0,2.44),(.38,.33,.16),white,'Head'); sphere('Cap rim',(0,-.01,2.37),(.39,.335,.04),white,'Head')
    for side,s in [('L',-1),('R',1)]:
        rod('Upper sleeve',(s*.4,0,1.45),(s*.72,-.01,.91),.16,cloth,'Arm.'+side); rod('Lower sleeve',(s*.72,-.01,.91),(s*.78,-.035,.43),.13,cloth,'Forearm.'+side); sphere('Hand',(s*.79,-.04,.32),(.12,.12,.15),skin,'Forearm.'+side)
    # Three named looping actions; each is stored as an NLA strip for GLB export.
    for action_name in ('Idle','Explain','Answer'):
        action=bpy.data.actions.new(action_name); rig.animation_data_create(); rig.animation_data.action=action
        for frame in (1,24,48):
            bpy.context.scene.frame_set(frame)
            for bn in ('Spine','Head','Arm.L','Arm.R'):
                pb=rig.pose.bones[bn]; pb.rotation_mode='XYZ'; pb.rotation_euler=(0,0,0)
            if action_name=='Idle': rig.pose.bones['Head'].rotation_euler[1]=.025 if frame==24 else 0
            elif action_name=='Explain':
                rig.pose.bones['Arm.R'].rotation_euler[1]=-.42 if frame==24 else 0; rig.pose.bones['Head'].rotation_euler[1]=.04 if frame==24 else 0
            else:
                rig.pose.bones['Arm.L'].rotation_euler[1]=.42 if frame==24 else 0; rig.pose.bones['Head'].rotation_euler[0]=-.035 if frame==24 else 0
            for bn in ('Spine','Head','Arm.L','Arm.R'): rig.pose.bones[bn].keyframe_insert(data_path='rotation_euler',frame=frame,group=bn)
        rig.animation_data.action=action
                track = rig.animation_data.nla_tracks.new()
        track.name = action_name
        strip = track.strips.new(action_name, 1, action)
        strip.name = action_name
        strip.blend_type = 'REPLACE'
        strip.extrapolation = 'NOTHING'
        rig.animation_data.action = None
    os.makedirs('public/assets',exist_ok=True)
    bpy.ops.object.select_all(action='DESELECT'); rig.select_set(True)
    for o in bpy.context.scene.objects:
        if o.type=='MESH': o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=f'public/assets/{role}.glb',export_format='GLB',use_selection=True,export_animations=True,export_nla_strips=True,export_force_sampling=True)
    print('Created public/assets/'+role+'.glb')

if __name__=='__main__':
    build('ustad'); build('student')
