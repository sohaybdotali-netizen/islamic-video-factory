import bpy
import math
import os
from mathutils import Vector

OUTPUT_DIR = os.path.join("public", "assets")


def make_material(name, color, roughness=0.82, metallic=0.0):
    material = bpy.data.materials.new(name)
    material.diffuse_color = (*color, 1.0)
    material.use_nodes = True
    shader = material.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = (*color, 1.0)
    shader.inputs["Roughness"].default_value = roughness
    shader.inputs["Metallic"].default_value = metallic
    return material


def parent_to_bone_keep_world(obj, rig, bone_name):
    """Parent an object to a pose bone without moving it in world space.

    This is the key fix for the previous disconnected/floating character parts.
    The old script parented objects to the armature but did not compensate for
    the bone's transform, shifting heads and limbs away from the torso.
    """
    world_matrix = obj.matrix_world.copy()
    obj.parent = rig
    obj.parent_type = "BONE"
    obj.parent_bone = bone_name
    bpy.context.view_layer.update()
    obj.matrix_world = world_matrix
    bpy.context.view_layer.update()
    return obj


def ellipsoid(name, location, scale, material, rig, bone_name="Spine"):
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=40,
        ring_count=28,
        location=location
    )
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(
        location=False,
        rotation=False,
        scale=True
    )
    obj.data.materials.append(material)
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return parent_to_bone_keep_world(obj, rig, bone_name)


def capsule_between(name, start, end, radius, material, rig, bone_name):
    start = Vector(start)
    end = Vector(end)
    direction = end - start
    midpoint = (start + end) * 0.5

    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=32,
        ring_count=24,
        location=midpoint
    )
    obj = bpy.context.object
    obj.name = name
    obj.scale = (radius, radius, direction.length * 0.62 + radius)
    obj.rotation_mode = "QUATERNION"
    obj.rotation_quaternion = direction.to_track_quat("Z", "Y")
    bpy.ops.object.transform_apply(
        location=False,
        rotation=False,
        scale=True
    )
    obj.data.materials.append(material)
    for polygon in obj.data.polygons:
        polygon.use_smooth = True
    return parent_to_bone_keep_world(obj, rig, bone_name)


def create_rig(role):
    armature = bpy.data.armatures.new(role + "_RigData")
    rig = bpy.data.objects.new(role + "_Rig", armature)
    bpy.context.collection.objects.link(rig)
    bpy.context.view_layer.objects.active = rig
    rig.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")

    bones = {
        "Root": ((0, 0, 0.0), (0, 0, 0.25), None),
        "Spine": ((0, 0, 0.25), (0, 0, 1.55), "Root"),
        "Head": ((0, 0, 1.55), (0, 0, 2.55), "Spine"),
        "Arm.L": ((-0.38, 0, 1.42), (-0.78, 0, 0.92), "Spine"),
        "Arm.R": ((0.38, 0, 1.42), (0.78, 0, 0.92), "Spine"),
        "Forearm.L": ((-0.78, 0, 0.92), (-0.84, -0.02, 0.48), "Arm.L"),
        "Forearm.R": ((0.78, 0, 0.92), (0.84, -0.02, 0.48), "Arm.R"),
        "Jaw": ((0, -0.12, 1.83), (0, -0.12, 2.02), "Head")
    }

    for name, (head, tail, parent_name) in bones.items():
        bone = armature.edit_bones.new(name)
        bone.head = head
        bone.tail = tail
        if parent_name:
            bone.parent = armature.edit_bones[parent_name]

    bpy.ops.object.mode_set(mode="OBJECT")
    rig.select_set(False)
    return rig


def create_animation(rig, clip_name):
    rig.animation_data_create()
    action = bpy.data.actions.new(clip_name)
    rig.animation_data.action = action

    for frame in (1, 12, 24, 36, 48):
        bpy.context.scene.frame_set(frame)
        for bone_name in ("Spine", "Head", "Arm.L", "Arm.R", "Jaw"):
            bone = rig.pose.bones[bone_name]
            bone.rotation_mode = "XYZ"
            bone.rotation_euler = (0, 0, 0)

        if clip_name == "Idle":
            rig.pose.bones["Head"].rotation_euler[1] = (
                0.025 if frame in (12, 36) else 0
            )
        elif clip_name == "Explain":
            rig.pose.bones["Arm.R"].rotation_euler[1] = (
                -0.30 if frame in (12, 24) else 0
            )
            rig.pose.bones["Head"].rotation_euler[1] = (
                0.035 if frame in (12, 24) else 0
            )
            rig.pose.bones["Jaw"].rotation_euler[0] = (
                -0.10 if frame in (12, 24, 36) else 0
            )
        elif clip_name == "Answer":
            rig.pose.bones["Arm.L"].rotation_euler[1] = (
                0.32 if frame in (12, 24) else 0
            )
            rig.pose.bones["Head"].rotation_euler[0] = (
                -0.025 if frame in (12, 24) else 0
            )
            rig.pose.bones["Jaw"].rotation_euler[0] = (
                -0.10 if frame in (12, 24, 36) else 0
            )

        for bone_name in ("Spine", "Head", "Arm.L", "Arm.R", "Jaw"):
            rig.pose.bones[bone_name].keyframe_insert(
                data_path="rotation_euler",
                frame=frame,
                group=bone_name
            )

    track = rig.animation_data.nla_tracks.new()
    track.name = clip_name
    strip = track.strips.new(clip_name, 1, action)
    strip.name = clip_name
    strip.blend_type = "REPLACE"
    rig.animation_data.action = None
    print("Created animation:", clip_name)


def build_character(role):
    print("Building educational cartoon character:", role)
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)

    is_teacher = role == "ustad"

    skin = make_material("Warm friendly skin", (0.58, 0.34, 0.23))
    clothing = make_material(
        "Ustad deep teal robe" if is_teacher else "Student cream kurta",
        (0.035, 0.25, 0.20) if is_teacher else (0.93, 0.87, 0.73)
    )
    vest = make_material("Student emerald waistcoat", (0.035, 0.42, 0.25))
    white = make_material("Soft ivory headwear", (0.98, 0.96, 0.89))
    beard = make_material("Ustad warm dark beard", (0.12, 0.065, 0.035))
    hair = make_material("Student dark hair", (0.10, 0.055, 0.03))
    eye_white = make_material("Eye whites", (1.0, 0.99, 0.94))
    pupil = make_material("Dark pupils", (0.025, 0.018, 0.015), 0.35)
    iris = make_material("Warm brown iris", (0.20, 0.095, 0.035), 0.35)
    mouth = make_material("Smile", (0.20, 0.045, 0.035))
    lip = make_material("Cheek and lip accent", (0.52, 0.16, 0.13))
    gold = make_material("Soft gold accents", (0.78, 0.57, 0.22), 0.42, 0.18)

    rig = create_rig(role)

    # Torso and clothing
    ellipsoid("Rounded torso", (0, 0, 1.00), (0.53, 0.34, 0.72), clothing, rig, "Spine")
    if not is_teacher:
        ellipsoid("Waistcoat front", (0, -0.285, 1.05), (0.37, 0.075, 0.48), vest, rig, "Spine")
        ellipsoid("Waistcoat left trim", (-0.19, -0.345, 1.08), (0.025, 0.018, 0.43), gold, rig, "Spine")
        ellipsoid("Waistcoat right trim", (0.19, -0.345, 1.08), (0.025, 0.018, 0.43), gold, rig, "Spine")

    # Neck and head
    ellipsoid("Neck", (0, 0, 1.62), (0.17, 0.17, 0.20), skin, rig, "Head")
    ellipsoid("Head", (0, -0.015, 2.04), (0.48, 0.39, 0.55), skin, rig, "Head")
    for x in (-0.43, 0.43):
        ellipsoid("Ear", (x, -0.015, 2.02), (0.12, 0.13, 0.17), skin, rig, "Head")

    # Large, friendly eyes and a clear smile
    for x in (-0.18, 0.18):
        ellipsoid("Eye socket", (x, -0.365, 2.13), (0.115, 0.045, 0.145), eye_white, rig, "Head")
        ellipsoid("Iris", (x, -0.405, 2.125), (0.060, 0.025, 0.083), iris, rig, "Head")
        ellipsoid("Pupil", (x, -0.425, 2.125), (0.031, 0.018, 0.052), pupil, rig, "Head")
        ellipsoid("Eye sparkle", (x - 0.018, -0.444, 2.16), (0.018, 0.012, 0.023), eye_white, rig, "Head")
        ellipsoid("Eyebrow", (x, -0.37, 2.31), (0.115, 0.035, 0.035), beard if is_teacher else hair, rig, "Head")

    ellipsoid("Nose", (0, -0.405, 2.00), (0.075, 0.075, 0.105), skin, rig, "Head")
    ellipsoid("Smile mouth", (0, -0.385, 1.89), (0.115, 0.035, 0.045), mouth, rig, "Jaw")
    ellipsoid("Lower lip", (0, -0.414, 1.865), (0.075, 0.018, 0.018), lip, rig, "Jaw")

    for x in (-0.30, 0.30):
        ellipsoid("Cheek blush", (x, -0.335, 1.96), (0.075, 0.018, 0.045), lip, rig, "Head")

    if is_teacher:
        ellipsoid("Beard main", (0, -0.285, 1.72), (0.34, 0.20, 0.31), beard, rig, "Head")
        ellipsoid("Beard tip", (0, -0.27, 1.53), (0.20, 0.15, 0.20), beard, rig, "Head")
        ellipsoid("Moustache", (0, -0.425, 1.91), (0.19, 0.065, 0.065), beard, rig, "Head")
        ellipsoid("Turban base", (0, 0.005, 2.52), (0.49, 0.40, 0.25), white, rig, "Head")
        ellipsoid("Turban front fold", (0, -0.345, 2.51), (0.30, 0.075, 0.12), white, rig, "Head")
        ellipsoid("Turban gold band", (0, -0.405, 2.45), (0.29, 0.025, 0.025), gold, rig, "Head")
        for x in (-0.18, 0.18):
            bpy.ops.mesh.primitive_torus_add(
                major_radius=0.105,
                minor_radius=0.012,
                major_segments=32,
                minor_segments=10,
                location=(x, -0.415, 2.13),
                rotation=(math.pi / 2, 0, 0)
            )
            glasses = bpy.context.object
            glasses.name = "Round spectacles"
            glasses.data.materials.append(gold)
            parent_to_bone_keep_world(glasses, rig, "Head")
        ellipsoid("Spectacle bridge", (0, -0.43, 2.13), (0.055, 0.018, 0.018), gold, rig, "Head")
    else:
        ellipsoid("Student hair", (0, 0.005, 2.43), (0.43, 0.34, 0.20), hair, rig, "Head")
        ellipsoid("White prayer cap", (0, 0, 2.52), (0.43, 0.36, 0.18), white, rig, "Head")
        ellipsoid("Cap band", (0, -0.015, 2.43), (0.435, 0.355, 0.045), white, rig, "Head")

    # Rounded, articulated arms and hands
    for side, sign in (("L", -1), ("R", 1)):
        capsule_between("Upper sleeve", (sign * 0.40, 0, 1.40), (sign * 0.70, -0.015, 0.98), 0.17, clothing, rig, "Arm." + side)
        capsule_between("Lower sleeve", (sign * 0.70, -0.015, 0.98), (sign * 0.78, -0.045, 0.55), 0.13, clothing, rig, "Forearm." + side)
        ellipsoid("Hand", (sign * 0.79, -0.055, 0.46), (0.13, 0.12, 0.15), skin, rig, "Forearm." + side)

    create_animation(rig, "Idle")
    create_animation(rig, "Explain")
    create_animation(rig, "Answer")

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    bpy.ops.object.select_all(action="DESELECT")
    rig.select_set(True)
    for obj in bpy.context.scene.objects:
        if obj.type == "MESH":
            obj.select_set(True)

    output_path = os.path.join(OUTPUT_DIR, role + ".glb")
    bpy.ops.export_scene.gltf(
        filepath=output_path,
        export_format="GLB",
        use_selection=True,
        export_animations=True,
        export_nla_strips=True,
        export_force_sampling=True
    )
    if not os.path.isfile(output_path) or os.path.getsize(output_path) < 1000:
        raise RuntimeError("GLB export failed: " + output_path)
    print("GENERATED:", output_path, os.path.getsize(output_path), "bytes")


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    build_character("ustad")
    build_character("student")
    print("Both educational cartoon characters generated successfully.")


if __name__ == "__main__":
    main()
