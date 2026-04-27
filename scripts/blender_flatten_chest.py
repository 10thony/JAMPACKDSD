import sys
import bpy
import bmesh
from mathutils import Vector


def parse_args():
    argv = sys.argv
    if "--" in argv:
        argv = argv[argv.index("--") + 1 :]
    else:
        argv = []
    if len(argv) < 2:
        raise SystemExit("Usage: blender -b -P scripts/blender_flatten_chest.py -- <input.glb> <output.glb>")
    return argv[0], argv[1]


def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)


def import_glb(path):
    bpy.ops.import_scene.gltf(filepath=path)


def get_primary_mesh():
    meshes = [obj for obj in bpy.context.scene.objects if obj.type == "MESH"]
    if not meshes:
        raise RuntimeError("No mesh objects found in imported GLB.")
    return max(meshes, key=lambda o: len(o.data.vertices))


def apply_object_transforms(obj):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)


def flatten_chest(obj):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.mode_set(mode="EDIT")
    bm = bmesh.from_edit_mesh(obj.data)
    bm.verts.ensure_lookup_table()

    xs = [v.co.x for v in bm.verts]
    ys = [v.co.y for v in bm.verts]
    zs = [v.co.z for v in bm.verts]
    min_x, max_x = min(xs), max(xs)
    min_y, max_y = min(ys), max(ys)
    min_z, max_z = min(zs), max(zs)

    width = max_x - min_x
    depth = max_y - min_y
    height = max_z - min_z

    chest_z_min = min_z + height * 0.52
    chest_z_max = min_z + height * 0.74
    x_limit = width * 0.42
    front_target = min_y + depth * 0.56
    max_push = depth * 0.11

    selected = []
    for v in bm.verts:
        if chest_z_min <= v.co.z <= chest_z_max and abs(v.co.x) <= x_limit and v.co.y > front_target:
            zt = (v.co.z - chest_z_min) / max(chest_z_max - chest_z_min, 1e-6)
            bell = 1.0 - abs(zt - 0.5) * 2.0
            push = max_push * max(bell, 0.15)
            v.co.y = max(front_target, v.co.y - push)
            v.select = True
            selected.append(v)
        else:
            v.select = False

    for _ in range(10):
        bmesh.ops.smooth_vert(
            bm,
            verts=selected,
            factor=0.32,
            use_axis_x=False,
            use_axis_y=True,
            use_axis_z=False,
        )

    bmesh.update_edit_mesh(obj.data)
    bpy.ops.object.mode_set(mode="OBJECT")


def export_glb(path):
    bpy.ops.object.select_all(action="DESELECT")
    for obj in bpy.context.scene.objects:
        if obj.type == "MESH":
            obj.select_set(True)
    bpy.ops.export_scene.gltf(filepath=path, export_format="GLB", use_selection=True)


def main():
    input_path, output_path = parse_args()
    clear_scene()
    import_glb(input_path)
    mesh = get_primary_mesh()
    apply_object_transforms(mesh)
    flatten_chest(mesh)
    export_glb(output_path)
    print(f"Exported: {output_path}")


if __name__ == "__main__":
    main()
