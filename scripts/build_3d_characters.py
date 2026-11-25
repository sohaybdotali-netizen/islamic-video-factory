import bpy
import math
import os
from mathutils import Vector

OUT = os.path.join('public', 'assets')

# Child-friendly stylized character generator for Blender 5.x.
# Creates two separate GLB files with named Idle / Explain / Answer clips.

def mat(name, color, rough=0.82, metallic=0.0):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1.0)
    m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*color, 1.0)
    p.inputs['Roughness'].default_value = rough
    p.inputs['Metallic'].default_value = metallic
    return m


def ellipsoid(name, loc, scale, material, rig, bone='Spine'):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=40, ring_count=28, location=loc)
    o = bpy.context.object
    o.name = name
    o.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(material)
    for f in o.data.polygons:
        f.use_smooth = True
    o.parent = rig
    o.parent_type = 'BONE'
    o.parent_bone = bone
    o.matrix_parent_inverse = rig.matrix_world.inverted()
    return o


def capsule_between(name, a, b, radius, material, rig, bone):
    a, b = Vector(a), Vector(b)
    d = b - a
    mid = (a + b) * 0.5
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=20, location=mid)
    o = bpy.context.object
    o.name = name
    o.scale = (radius, radius, d.length * 0.62 + radius)
    o.rotation_mode = 'QUATERNION'
    o.rotation_quaternion = d.to_track_quat('Z', 'Y')
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(material)
    for f in o.data.polygons:
        f.use_smooth = True
    o.parent = rig
    o.parent_type = 'BONE'
    o.parent_bone = bone
    o.matrix_parent_inverse = rig.matrix_world.inverted()
    return o


def create_rig(role):
    arm = bpy.data.armatures.new(role + '_RigData')
    rig = bpy.data.objects.new(role + '_Rig', arm)
    bpy.context.collection.objects.link(rig)
    bpy.context.view_layer.objects.active = rig
    rig.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    definitions = {
        'Root': ((0,0,0.0),(0,0,0.25),None),
        'Spine': ((0,0,0.25),(0,0,1.55),'Root'),
        'Head': ((0,0,1.55),(0,0,2.55),'Spine'),
        'Arm.L': ((-.38,0,1.42),(-.78,0,.92),'Spine'),
        'Arm.R': ((.38,0,1.42),(.78,0,.92),'Spine'),
        'Forearm.L': ((-.78,0,.92),(-.84,-.02,.48),'Arm.L'),
        'Forearm.R': ((.78,0,.92),(.84,-.02,.48),'Arm.R'),
        'Jaw': ((0,-.12,1.83),(0,-.12,2.02),'Head')
    }
    for name, (head, tail, parent) in definitions.items():
        b = arm.edit_bones.new(name)
        b.head, b.tail = head, tail
        if parent:
            b.parent = arm.edit_bones[parent]
    bpy.ops.object.mode_set(mode='OBJECT')
    rig.select_set(False)
    return rig


def make_character(role):
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    teacher = role == 'ustad'

    skin = mat('Warm friendly skin', (.58,.34,.23))
    robe = mat('Ustad deep teal robe' if teacher else 'Student cream kurta', (.035,.25,.20) if teacher else (.93,.87,.73))
    vest = mat('Student bright emerald waistcoat', (.035,.42,.25))
    white = mat('Soft ivory headwear', (.98,.96,.89))
    beard = mat('Ustad warm dark beard', (.12,.065,.035))
    hair = mat('Dark hair', (.10,.055,.03))
    eye_white = mat('Eye whites', (1.0,.99,.94))
    pupil = mat('Dark pupils', (.025,.018,.015), .35)
    iris = mat('Warm brown iris', (.20,.095,.035), .35)
    mouth = mat('Smile', (.20,.045,.035))
    lip = mat('Lower lip', (.52,.16,.13))
    gold = mat('Soft gold accents', (.78,.57,.22), .42, .18)

    rig = create_rig(role)

    # Rounded, child-friendly torso and clothing silhouette.
    ellipsoid('Rounded torso', (0,0,1.00), (.53,.34,.72), robe, rig, 'Spine')
    ellipsoid('Neck', (0,0,1.62), (.17,.17,.20), skin, rig, 'Head')
    if not teacher:
        ellipsoid('Waistcoat front', (0,-.285,1.05), (.37,.075,.48), vest, rig, 'Spine')
        # Waistcoat trim
        ellipsoid('Waistcoat left trim', (-.19,-.345,1.08), (.025,.018,.43), gold, rig, 'Spine')
        ellipsoid('Waistcoat right trim', (.19,-.345,1.08), (.025,.018,.43), gold, rig, 'Spine')

    # Large expressive head and cheeks.
    ellipsoid('Head', (0,-.015,2.04), (.48,.39,.55), skin, rig, 'Head')
    for x in (-.43,.43):
        ellipsoid('Ear', (x,-.015,2.02), (.12,.13,.17), skin, rig, 'Head')
    for x in (-.18,.18):
        ellipsoid('Eye socket', (x,-.365,2.13), (.115,.045,.145), eye_white, rig, 'Head')
        ellipsoid('Iris', (x,-.405,2.125), (.060,.025,.083), iris, rig, 'Head')
        ellipsoid('Pupil', (x,-.425,2.125), (.031,.018,.052), pupil, rig, 'Head')
        ellipsoid('Eye sparkle', (x-.018,-.444,2.16), (.018,.012,.023), eye_white, rig, 'Head')
        ellipsoid('Eyebrow', (x,-.37,2.31), (.115,.035,.035), beard if teacher else hair, rig, 'Head')
    ellipsoid('Nose', (0,-.405,2.00), (.075,.075,.105), skin, rig, 'Head')
    # A visible smile and separate jaw element for simple mouth movement.
    ellipsoid('Smile mouth', (0,-.385,1.89), (.115,.035,.045), mouth, rig, 'Jaw')
    ellipsoid('Lower lip', (0,-.414,1.865), (.075,.018,.018), lip, rig, 'Jaw')
    for x in (-.30,.30):
        ellipsoid('Cheek blush', (x,-.335,1.96), (.075,.018,.045), lip, rig, 'Head')

    if teacher:
        ellipsoid('Beard main', (0,-.285,1.72), (.34,.20,.31), beard, rig, 'Head')
        ellipsoid('Beard tip', (0,-.27,1.53), (.20,.15,.20), beard, rig, 'Head')
        ellipsoid('Moustache', (0,-.425,1.91), (.19,.065,.065), beard, rig, 'Head')
        ellipsoid('Turban base', (0,.005,2.52), (.49,.40,.25), white, rig, 'Head')
        ellipsoid('Turban front fold', (0,-.345,2.51), (.30,.075,.12), white, rig, 'Head')
        ellipsoid('Turban gold band', (0,-.405,2.45), (.29,.025,.025), gold, rig, 'Head')
        # Spectacle rims
        for x in (-.18,.18):
            bpy.ops.mesh.primitive_torus_add(major_radius=.105, minor_radius=.012, major_segments=32, minor_segments=10,
                                            location=(x,-.415,2.13), rotation=(math.pi/2,0,0))
            o=bpy.context.object; o.name='Round spectacles'; o.data.materials.append(gold)
            o.parent=rig; o.parent_type='BONE'; o.parent_bone='Head'; o.matrix_parent_inverse=rig.matrix_world.inverted()
        ellipsoid('Spectacle bridge', (0,-.43,2.13), (.055,.018,.018), gold, rig, 'Head')
    else:
        ellipsoid('Student hair', (0,.005,2.43), (.43,.34,.20), hair, rig, 'Head')
        ellipsoid('White prayer cap', (0,0,2.52), (.43,.36,.18), white, rig, 'Head')
        ellipsoid('Cap band', (0,-.015,2.43), (.435,.355,.045), white, rig, 'Head')

    # Rounded arms, sleeves and hands.
    for side, sign in (('L',-1),('R',1)):
        capsule_between('Upper sleeve', (sign*.40,0,1.40), (sign*.70,-.015,.98), .17, robe, rig, 'Arm.'+side)
        capsule_between('Lower sleeve', (sign*.70,-.015,.98), (sign*.78,-.045,.55), .13, robe, rig, 'Forearm.'+side)
        ellipsoid('Hand', (sign*.79,-.055,.46), (.13,.12,.15), skin, rig, 'Forearm.'+side)

    # Three simple deterministic gesture clips; jaw movement gives a basic speaking cue.
    rig.animation_data_create()
    for clip_name in ('Idle','Explain','Answer'):
        action = bpy.data.actions.new(clip_name)
        rig.animation_data.action = action
        for frame in (1,12,24,36,48):
            bpy.context.scene.frame_set(frame)
            for bn in ('Spine','Head','Arm.L','Arm.R','Jaw'):
                pb=rig.pose.bones[bn]
                pb.rotation_mode='XYZ'
                pb.rotation_euler=(0,0,0)
            if clip_name == 'Idle':
                rig.pose.bones['Head'].rotation_euler[1] = .025 if frame in (12,36) else 0
            elif clip_name == 'Explain':
                rig.pose.bones['Arm.R'].rotation_euler[1] = -.30 if frame in (12,24) else 0
                rig.pose.bones['Head'].rotation_euler[1] = .035 if frame in (12,24) else 0
                rig.pose.bones['Jaw'].rotation_euler[0] = -.10 if frame in (12,24,36) else 0
            else:
                rig.pose.bones['Arm.L'].rotation_euler[1] = .32 if frame in (12,24) else 0
                rig.pose.bones['Head'].rotation_euler[0] = -.025 if frame in (12,24) else 0
                rig.pose.bones['Jaw'].rotation_euler[0] = -.10 if frame in (12,24,36) else 0
            for bn in ('Spine','Head','Arm.L','Arm.R','Jaw'):
                rig.pose.bones[bn].keyframe_insert(data_path='rotation_euler', frame=frame, group=bn)
        track=rig.animation_data.nla_tracks.new(); track.name=clip_name
        strip=track.strips.new(clip_name,1,action); strip.name=clip_name
        strip.blend_type='REPLACE'
        rig.animation_data.action=None

    os.makedirs(OUT,exist_ok=True)
    bpy.ops.object.select_all(action='DESELECT')
    rig.select_set(True)
    for obj in bpy.context.scene.objects:
        if obj.type=='MESH': obj.select_set(True)
    path=os.path.join(OUT,role+'.glb')
    bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', use_selection=True,
                              export_animations=True, export_nla_strips=True, export_force_sampling=True)
    if not os.path.isfile(path) or os.path.getsize(path)<1000:
        raise RuntimeError('GLB export failed or file is too small: '+path)
    print('GENERATED',path,os.path.getsize(path))


def main():
    make_character('ustad')
    make_character('student')
    print('Both educational cartoon characters generated.')

if __name__ == '__main__':
    main()
