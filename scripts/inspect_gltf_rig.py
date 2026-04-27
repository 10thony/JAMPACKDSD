import bpy

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)

bpy.ops.import_scene.gltf(filepath="C:/Projects/Portfolio/humanoid_from_blend.glb")

print("---ARMATURES---")
for obj in bpy.data.objects:
    if obj.type == "ARMATURE":
        print(obj.name)

print("---BONES---")
for obj in bpy.data.objects:
    if obj.type == "ARMATURE":
        for bone in obj.data.bones:
            print(bone.name)
