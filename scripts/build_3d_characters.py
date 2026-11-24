
import bpy
import math
import os
from mathutils import Vector

# ============================================================
# ISLAMIC VIDEO FACTORY
# Procedural 3D Ustad and Student Character Generator
# Blender 5 compatible
# ============================================================

OUTPUT_DIR = os.path.join("public", "assets")


def make_material(name, color, roughness=0.75, metallic=0.0):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1.0)
    mat.use_nodes = True

    shader = mat.node_tree.nodes.get("Principled BSDF")
    if shader:
        shader.inputs["Base Color"].default_value = (*color, 1.0)
        shader.inputs["Roughness"].default_value = roughness
        shader.inputs["Metallic"].default_value = metallic

    return mat


def make_sphere(name, location, scale, material, rig, bone):
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=32,
        ring_count=24,
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

    for face in obj.data.polygons:
        face.use_smooth = True

    obj.parent = rig
    obj.parent_type = "BONE"
    obj.parent_bone = bone
    obj.matrix_parent_inverse = rig.matrix_world.inverted()

    return obj


def make_rod(name, start, end, radius, material, rig, bone):
    direction = Vector(end) - Vector(start)
    midpoint = (Vector(start) + Vector(end)) / 2

    bpy.ops.mesh.primitive_cylinder_add(
        vertices=24,
        radius=radius,
        depth=direction.length,
        location=midpoint
    )

    obj = bpy.context.object
    obj.name = name
    obj.rotation_mode = "QUATERNION"
    obj.rotation_quaternion = direction.to_track_quat("Z", "Y")
    obj.data.materials.append(material)

    bevel = obj.modifiers.new("Rounded edges", "BEVEL")
    bevel.width = 0.05
    bevel.segments = 3

    obj.modifiers.new("Weighted normals", "WEIGHTED_NORMAL")

    obj.parent = rig
    obj.parent_type = "BONE"
    obj.parent_bone = bone
    obj.matrix_parent_inverse = rig.matrix_world.inverted()

    return obj


def create_rig(role):
    armature = bpy.data.armatures.new(role + "_Armature")
    rig = bpy.data.objects.new(role + "_Rig", armature)

    bpy.context.collection.objects.link(rig)
    bpy.context.view_layer.objects.active = rig
    rig.select_set(True)

    bpy.ops.object.mode_set(mode="EDIT")

    bones = {
        "Root": ((0, 0, 0.0), (0, 0, 0.3), None),

        "Spine": (
            (0, 0, 0.3),
            (0, 0, 1.65),
            "Root"
        ),

        "Head": (
            (0, 0, 1.65),
            (0, 0, 2.45),
            "Spine"
        ),

        "Arm.L": (
            (-0.4, 0, 1.45),
            (-0.78, 0, 0.8),
            "Spine"
        ),

        "Arm.R": (
            (0.4, 0, 1.45),
            (0.78, 0, 0.8),
            "Spine"
        ),

        "Forearm.L": (
            (-0.78, 0, 0.8),
            (-0.82, 0, 0.35),
            "Arm.L"
        ),

        "Forearm.R": (
            (0.78, 0, 0.8),
            (0.82, 0, 0.35),
            "Arm.R"
        )
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


def create_animation(rig, animation_name):
    rig.animation_data_create()

    action = bpy.data.actions.new(animation_name)
    rig.animation_data.action = action

    for frame in (1, 24, 48):
        bpy.context.scene.frame_set(frame)

        for bone_name in ("Spine", "Head", "Arm.L", "Arm.R"):
            bone = rig.pose.bones[bone_name]
            bone.rotation_mode = "XYZ"
            bone.rotation_euler = (0, 0, 0)

        if animation_name == "Idle":
            rig.pose.bones["Head"].rotation_euler[1] = (
                0.025 if frame == 24 else 0
            )

        elif animation_name == "Explain":
            rig.pose.bones["Arm.R"].rotation_euler[1] = (
                -0.42 if frame == 24 else 0
            )
            rig.pose.bones["Head"].rotation_euler[1] = (
                0.04 if frame == 24 else 0
            )

        elif animation_name == "Answer":
            rig.pose.bones["Arm.L"].rotation_euler[1] = (
                0.42 if frame == 24 else 0
            )
            rig.pose.bones["Head"].rotation_euler[0] = (
                -0.035 if frame == 24 else 0
            )

        for bone_name in ("Spine", "Head", "Arm.L", "Arm.R"):
            rig.pose.bones[bone_name].keyframe_insert(
                data_path="rotation_euler",
                frame=frame,
                group=bone_name
            )

    # Store the action as a named NLA strip.
    track = rig.animation_data.nla_tracks.new()
    track.name = animation_name

    strip = track.strips.new(animation_name, 1, action)
    strip.name = animation_name
    strip.blend_type = "REPLACE"
    strip.extrapolation = "NOTHING"

    rig.animation_data.action = None

    print("Created animation:", animation_name)


def build_character(role):
    print("\nBuilding character:", role)

    # Start with a clean Blender scene.
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)

    is_teacher = role == "ustad"

    # Materials
    skin = make_material(
        "Warm natural skin",
        (0.48, 0.26, 0.16)
    )

    robe = make_material(
        "Ustad forest green robe" if is_teacher else "Student ivory kurta",
        (0.025, 0.16, 0.105) if is_teacher else (0.88, 0.84, 0.74)
    )

    vest = make_material(
        "Emerald waistcoat",
        (0.025, 0.24, 0.15)
    )

    white = make_material(
        "White headwear",
        (0.95, 0.93, 0.86)
    )

    beard = make_material(
        "Dark brown beard",
        (0.075, 0.035, 0.02)
    )

    dark = make_material(
        "Eyes",
        (0.012, 0.009, 0.007)
    )

    gold = make_material(
        "Golden details",
        (0.68, 0.46, 0.16),
        0.4,
        0.35
    )

    rig = create_rig(role)

    # Body
    make_sphere(
        "Body",
        (0, 0, 1.02),
        (0.57, 0.34, 0.82),
        robe,
        rig,
        "Spine"
    )

    if not is_teacher:
        make_sphere(
            "Green waistcoat",
            (0, -0.285, 1.08),
            (0.37, 0.09, 0.53),
            vest,
            rig,
            "Spine"
        )

    # Neck and face
    make_sphere(
        "Neck",
        (0, 0, 1.68),
        (0.18, 0.18, 0.22),
        skin,
        rig,
        "Head"
    )

    make_sphere(
        "Face",
        (0, -0.015, 2.02),
        (0.42, 0.35, 0.49),
        skin,
        rig,
        "Head"
    )

    # Ears
    for x in (-0.42, 0.42):
        make_sphere(
            "Ear",
            (x, -0.01, 2.02),
            (0.09, 0.11, 0.14),
            skin,
            rig,
            "Head"
        )

    # Eyes, pupils and eyebrows
    for x in (-0.155, 0.155):
        make_sphere(
            "Eye",
            (x, -0.34, 2.11),
            (0.052, 0.026, 0.067),
            white,
            rig,
            "Head"
        )

        make_sphere(
            "Pupil",
            (x, -0.365, 2.11),
            (0.024, 0.014, 0.038),
            dark,
            rig,
            "Head"
        )

        make_sphere(
            "Eyebrow",
            (x, -0.335, 2.22),
            (0.085, 0.025, 0.022),
            beard,
            rig,
            "Head"
        )

    # Nose
    make_sphere(
        "Nose",
        (0, -0.37, 1.99),
        (0.065, 0.07, 0.10),
        skin,
        rig,
        "Head"
    )

    if is_teacher:
        # Elder Ustad beard
        make_sphere(
            "Full beard",
            (0, -0.27, 1.77),
            (0.29, 0.18, 0.29),
            beard,
            rig,
            "Head"
        )

        make_sphere(
            "Moustache",
            (0, -0.39, 1.91),
            (0.17, 0.055, 0.06),
            beard,
            rig,
            "Head"
        )

        # White turban
        make_sphere(
            "White turban",
            (0, 0, 2.46),
            (0.47, 0.38, 0.23),
            white,
            rig,
            "Head"
        )

        make_sphere(
            "Turban fold",
            (0, -0.30, 2.47),
            (0.27, 0.07, 0.09),
            white,
            rig,
            "Head"
        )

        make_sphere(
            "Golden turban detail",
            (0, -0.365, 2.42),
            (0.25, 0.025, 0.025),
            gold,
            rig,
            "Head"
        )

        # Spectacles
        for x in (-0.155, 0.155):
            bpy.ops.mesh.primitive_torus_add(
                major_radius=0.095,
                minor_radius=0.012,
                major_segments=24,
                minor_segments=8,
                location=(x, -0.385, 2.11),
                rotation=(math.pi / 2, 0, 0)
            )

            glasses = bpy.context.object
            glasses.name = "Ustad spectacles"
            glasses.data.materials.append(gold)

            glasses.parent = rig
            glasses.parent_type = "BONE"
            glasses.parent_bone = "Head"
            glasses.matrix_parent_inverse = rig.matrix_world.inverted()

    else:
        # Student white prayer cap
        make_sphere(
            "White prayer cap",
            (0, 0, 2.44),
            (0.38, 0.33, 0.16),
            white,
            rig,
            "Head"
        )

        make_sphere(
            "Prayer cap rim",
            (0, -0.01, 2.37),
            (0.39, 0.335, 0.04),
            white,
            rig,
            "Head"
        )

    # Arms and hands
    for side, sign in (("L", -1), ("R", 1)):
        make_rod(
            "Upper sleeve",
            (sign * 0.4, 0, 1.45),
            (sign * 0.72, -0.01, 0.91),
            0.16,
            robe,
            rig,
            "Arm." + side
        )

        make_rod(
            "Lower sleeve",
            (sign * 0.72, -0.01, 0.91),
            (sign * 0.78, -0.035, 0.43),
            0.13,
            robe,
            rig,
            "Forearm." + side
        )

        make_sphere(
            "Hand",
            (sign * 0.79, -0.04, 0.32),
            (0.12, 0.12, 0.15),
            skin,
            rig,
            "Forearm." + side
        )

    # Named animations used by Classroom3D.tsx
    create_animation(rig, "Idle")
    create_animation(rig, "Explain")
    create_animation(rig, "Answer")

    # Export the character and armature as GLB.
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

    if not os.path.exists(output_path):
        raise RuntimeError("GLB export failed: " + output_path)

    if os.path.getsize(output_path) == 0:
        raise RuntimeError("GLB file is empty: " + output_path)

    print("SUCCESS:", output_path)
    print("File size:", os.path.getsize(output_path), "bytes")


def main():
    print("======================================")
    print("ISLAMIC VIDEO FACTORY 3D GENERATOR")
    print("======================================")

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    build_character("ustad")
    build_character("student")

    print("\n======================================")
    print("BOTH 3D CHARACTERS GENERATED")
    print("======================================")


if __name__ == "__main__":
    main()
