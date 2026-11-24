"""Build reusable rigged GLB characters for Islamic Video Factory.
Run with: blender --background --factory-startup --python scripts/build_3d_characters.py
The meshes are generated from Blender primitives, weighted to an armature, and exported with named actions.
"""
import bpy
import math
from pathlib import Path

ROOT = Path.cwd()
OUT = ROOT / "public" / "assets"
OUT.mkdir(parents=True, exist_ok=True)


def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for datablocks in (bpy.data.meshes, bpy.data.curves, bpy.data.materials, bpy.data.armatures, bpy.data.actions):
        for block in list(datablocks):
            if block.users == 0:
                datablocks.remove(block)


def material(name, color, roughness=0.72, metallic=0.0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1.0)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*color, 1.0)
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Metallic'].default_value = metallic
    return mat


def make_armature(role):
    bpy.ops.object.armature_add(enter_editmode=True, location=(0, 0, 0))
    arm = bpy.context.object
    arm.name = f"{role.title()}_Rig"
    arm.data.name = f"{role.title()}_Armature"
    edit = arm.data.edit_bones
    root = edit[0]
    root.name = 'Root'
    root.head = (0, 0, 0.05)
    root.tail = (0, 0, 0.95)

    def bone(name, head, tail, parent='Root'):
        b = edit.new(name)
        b.head = head
        b.tail = tail
        b.parent = edit.get(parent) if parent else None
        b.use_connect = False
        return b

    bone('Spine', (0, 0, 0.85), (0, 0, 2.0), 'Root')
    bone('Head', (0, 0, 1.95), (0, 0, 2.85), 'Spine')
    bone('Jaw', (0, -0.05, 2.08), (0, -0.05, 2.30), 'Head')
    bone('UpperArm.L', (-0.40, 0, 1.82), (-0.82, 0, 1.43), 'Spine')
    bone('Forearm.L', (-0.82, 0, 1.43), (-0.98, -0.02, 0.98), 'UpperArm.L')
    bone('UpperArm.R', (0.40, 0, 1.82), (0.82, 0, 1.43), 'Spine')
    bone('Forearm.R', (0.82, 0, 1.43), (0.98, -0.02, 0.98), 'UpperArm.R')
    bpy.ops.object.mode_set(mode='OBJECT')
    arm.show_in_front = True
    return arm


def attach_mesh(obj, arm, bone_name, mat):
    obj.name = f"{bone_name}_{obj.name}"
    if mat:
        obj.data.materials.append(mat)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    group = obj.vertex_groups.new(name=bone_name)
    if len(obj.data.vertices):
        group.add(list(range(len(obj.data.vertices))), 1.0, 'REPLACE')
    modifier = obj.modifiers.new('CharacterRig', 'ARMATURE')
    modifier.object = arm
    obj.parent = arm
    for poly in obj.data.polygons:
        poly.use_smooth = True
    return obj


def sphere(name, loc, scale, mat, arm, bone='Spine', segments=32, rings=24):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    return attach_mesh(obj, arm, bone, mat)


def torus(name, loc, major, minor, mat, arm, bone='Head', rotation=(math.pi / 2, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor, major_segments=36, minor_segments=10, location=loc, rotation=rotation)
    return attach_mesh(bpy.context.object, arm, bone, mat)


def limb(name, start, end, radius, mat, arm, bone):
    mid = tuple((a + b) / 2 for a, b in zip(start, end))
    direction = (end[0] - start[0], end[1] - start[1], end[2] - start[2])
    length = math.sqrt(sum(v * v for v in direction))
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=16, location=mid)
    obj = bpy.context.object
    obj.name = name
    obj.scale = (radius, radius, length / 2 + radius * 0.35)
    obj.rotation_mode = 'QUATERNION'
    from mathutils import Vector
    obj.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(Vector(direction))
    return attach_mesh(obj, arm, bone, mat)


def create_actions(arm, role):
    names = ['Idle', 'Talk', 'Explain'] if role == 'ustad' else ['Idle', 'Talk', 'Answer']
    for action_name in names:
        action = bpy.data.actions.new(name=action_name)
        arm.animation_data_create()
        arm.animation_data.action = action
        for pb in arm.pose.bones:
            pb.rotation_mode = 'XYZ'
            pb.rotation_euler = (0, 0, 0)
            pb.keyframe_insert(data_path='rotation_euler', frame=1, group=pb.name)

        if action_name == 'Idle':
            for frame, amount in [(1, 0), (16, 0.025), (31, 0), (46, -0.025), (61, 0)]:
                arm.pose.bones['Spine'].rotation_euler[1] = amount
                arm.pose.bones['Head'].rotation_euler[1] = -amount * 0.7
                arm.pose.bones['Spine'].keyframe_insert(data_path='rotation_euler', frame=frame, group='Spine')
                arm.pose.bones['Head'].keyframe_insert(data_path='rotation_euler', frame=frame, group='Head')
        elif action_name == 'Talk':
            for frame, amount in [(1, 0), (8, 0.035), (16, -0.025), (24, 0.035), (31, 0)]:
                arm.pose.bones['Head'].rotation_euler[0] = amount
                arm.pose.bones['Jaw'].rotation_euler[0] = 0.12 if amount > 0 else 0.02
                arm.pose.bones['Head'].keyframe_insert(data_path='rotation_euler', frame=frame, group='Head')
                arm.pose.bones['Jaw'].keyframe_insert(data_path='rotation_euler', frame=frame, group='Jaw')
        elif action_name == 'Explain':
            for frame, amount in [(1, 0), (12, -0.8), (24, -0.55), (36, -0.8), (48, 0), (60, 0)]:
                arm.pose.bones['UpperArm.R'].rotation_euler[1] = amount
                arm.pose.bones['Forearm.R'].rotation_euler[1] = -0.25
                arm.pose.bones['UpperArm.R'].keyframe_insert(data_path='rotation_euler', frame=frame, group='UpperArm.R')
                arm.pose.bones['Forearm.R'].keyframe_insert(data_path='rotation_euler', frame=frame, group='Forearm.R')
                arm.pose.bones['Head'].rotation_euler[0] = 0.025 if frame in (12, 36) else 0
                arm.pose.bones['Head'].keyframe_insert(data_path='rotation_euler', frame=frame, group='Head')
        elif action_name == 'Answer':
            for frame, amount in [(1, 0), (10, -1.05), (20, -1.05), (30, -1.05), (45, -1.05), (60, -1.05)]:
                arm.pose.bones['UpperArm.R'].rotation_euler[1] = amount
                arm.pose.bones['Forearm.R'].rotation_euler[1] = -0.35
                arm.pose.bones['UpperArm.R'].keyframe_insert(data_path='rotation_euler', frame=frame, group='UpperArm.R')
                arm.pose.bones['Forearm.R'].keyframe_insert(data_path='rotation_euler', frame=frame, group='Forearm.R')
                arm.pose.bones['Head'].rotation_euler[0] = 0.025 if frame in (10, 30) else 0
                arm.pose.bones['Head'].keyframe_insert(data_path='rotation_euler', frame=frame, group='Head')

        for fc in action.fcurves:
            for key in fc.keyframe_points:
                key.interpolation = 'BEZIER'
        action.frame_range = (1, 61)
    arm.animation_data.action = bpy.data.actions.get('Idle')


def build_character(role):
    clear_scene()
    arm = make_armature(role)
    skin = material('Warm medium skin', (0.58, 0.32, 0.20), 0.82)
    robe = material('Ivory shalwar kameez', (0.91, 0.88, 0.80), 0.9)
    green = material('Deep emerald waistcoat', (0.035, 0.19, 0.12), 0.72)
    gold = material('Antique gold trim', (0.72, 0.49, 0.16), 0.34, 0.55)
    white = material('Turban and cap white', (0.97, 0.96, 0.91), 0.78)
    dark = material('Deep brown hair and beard', (0.075, 0.055, 0.045), 0.96)
    eye = material('Eyes', (0.018, 0.014, 0.012), 0.35)
    mouth = material('Mouth', (0.16, 0.035, 0.035), 0.8)
    shoe = material('Dark leather shoes', (0.08, 0.055, 0.04), 0.5)

    # Robe, waistcoat and lower garment form a layered, rounded silhouette.
    sphere('Long ivory tunic', (0, 0, 1.12), (0.70, 0.43, 1.00), robe, arm, 'Spine')
    sphere('Emerald waistcoat', (0, -0.015, 1.36), (0.57, 0.455, 0.72), green, arm, 'Spine')
    sphere('Neck', (0, 0, 2.00), (0.22, 0.22, 0.28), skin, arm, 'Head')
    sphere('Friendly rounded face', (0, -0.015, 2.40), (0.49, 0.43, 0.59), skin, arm, 'Head', 40, 32)

    # Ears, eyes, brows, nose and mouth are separate rigged details.
    for side in (-1, 1):
        sphere('Ear', (side * 0.48, -0.02, 2.38), (0.105, 0.12, 0.17), skin, arm, 'Head')
        sphere('Eye white', (side * 0.18, -0.414, 2.48), (0.082, 0.035, 0.095), white, arm, 'Head', 20, 16)
        sphere('Dark pupil', (side * 0.18, -0.448, 2.475), (0.038, 0.022, 0.052), eye, arm, 'Head', 16, 12)
        sphere('Expressive eyebrow', (side * 0.18, -0.415, 2.60), (0.11, 0.035, 0.035), dark, arm, 'Head', 20, 12)
    sphere('Rounded nose', (0, -0.47, 2.32), (0.09, 0.105, 0.13), skin, arm, 'Head')
    sphere('Mouth opening', (0, -0.444, 2.18), (0.095, 0.025, 0.035), mouth, arm, 'Jaw')

    # Arms and hands are individually weighted to armature bones.
    for side, suffix in [(-1, 'L'), (1, 'R')]:
        limb('Upper sleeve', (side * 0.42, 0, 1.78), (side * 0.80, -0.015, 1.42), 0.19, robe, arm, f'UpperArm.{suffix}')
        limb('Lower sleeve', (side * 0.80, -0.015, 1.42), (side * 0.96, -0.04, 1.02), 0.155, robe, arm, f'Forearm.{suffix}')
        sphere('Hand', (side * 0.98, -0.05, 0.96), (0.14, 0.12, 0.17), skin, arm, f'Forearm.{suffix}')

    # Feet peek below the long tunic.
    for side in (-1, 1):
        sphere('Shoe', (side * 0.28, -0.08, 0.12), (0.20, 0.32, 0.12), shoe, arm, 'Root')

    if role == 'ustad':
        sphere('Full scholar beard', (0, -0.31, 1.99), (0.37, 0.25, 0.43), dark, arm, 'Head', 36, 28)
        sphere('Moustache left', (-0.09, -0.43, 2.19), (0.14, 0.07, 0.055), dark, arm, 'Head')
        sphere('Moustache right', (0.09, -0.43, 2.19), (0.14, 0.07, 0.055), dark, arm, 'Head')
        sphere('White turban base', (0, 0.015, 2.91), (0.59, 0.48, 0.29), white, arm, 'Head', 40, 28)
        for z, x in [(2.88, -0.12), (2.98, 0.10), (3.04, -0.04)]:
            sphere('Turban folded layer', (x, -0.13, z), (0.43, 0.35, 0.105), white, arm, 'Head')
        glasses = material('Antique bronze glasses', (0.24, 0.17, 0.08), 0.28, 0.75)
        for side in (-1, 1):
            torus('Round spectacles', (side * 0.18, -0.46, 2.47), 0.115, 0.018, glasses, arm)
        sphere('Spectacle bridge', (0, -0.47, 2.48), (0.10, 0.025, 0.018), glasses, arm, 'Head')
    else:
        sphere('Short dark hair', (0, 0.02, 2.78), (0.47, 0.40, 0.20), dark, arm, 'Head')
        sphere('White prayer cap', (0, 0.015, 2.91), (0.51, 0.46, 0.19), white, arm, 'Head', 36, 24)
        torus('Cap gold piping', (0, -0.01, 2.84), 0.46, 0.018, gold, arm, 'Head', rotation=(0, 0, 0))

    # Small gold buttons on the vest.
    for z in (1.68, 1.48, 1.28):
        sphere('Gold waistcoat button', (0, -0.47, z), (0.035, 0.025, 0.035), gold, arm, 'Spine', 16, 12)

    create_actions(arm, role)
    bpy.context.scene.frame_start = 1
    bpy.context.scene.frame_end = 61
    bpy.context.scene.render.fps = 30

    # Export all named actions and the skinned mesh as one GLB.
    bpy.ops.object.select_all(action='DESELECT')
    arm.select_set(True)
    for obj in bpy.context.scene.objects:
        if obj.type == 'MESH':
            obj.select_set(True)
    bpy.context.view_layer.objects.active = arm
    target = OUT / f'{role}.glb'
    bpy.ops.export_scene.gltf(
        filepath=str(target),
        export_format='GLB',
        use_selection=True,
        export_apply=True,
        export_animations=True,
        export_animation_mode='ACTIONS',
        export_skins=True,
        export_materials='EXPORT',
        export_yup=True,
    )
    print(f'[3D ASSETS] Wrote {target} ({target.stat().st_size} bytes)', flush=True)


build_character('ustad')
build_character('student')
print('[3D ASSETS] Both rigged character GLBs exported successfully.', flush=True)
