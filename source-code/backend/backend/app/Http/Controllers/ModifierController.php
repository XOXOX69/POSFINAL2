<?php

namespace App\Http\Controllers;

use App\Models\ModifierGroup;
use App\Models\ItemModifier;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ModifierController extends Controller
{
    // Get all modifier groups with their modifiers
    public function getAllGroups(): JsonResponse
    {
        try {
            $groups = ModifierGroup::with('modifiers')
                ->where('isActive', true)
                ->orderBy('name')
                ->get();

            return response()->json(arrayKeysToCamelCase($groups->toArray()), 200);
        } catch (Exception $err) {
            return response()->json(['error' => 'Failed to fetch modifier groups'], 500);
        }
    }

    // Get single group with modifiers
    public function getSingleGroup($id): JsonResponse
    {
        try {
            $group = ModifierGroup::with('modifiers')->findOrFail($id);
            return response()->json(arrayKeysToCamelCase($group->toArray()), 200);
        } catch (Exception $err) {
            return response()->json(['error' => 'Modifier group not found'], 404);
        }
    }

    // Create modifier group
    public function createGroup(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'isRequired' => 'nullable|boolean',
            'minSelect' => 'nullable|integer|min:0',
            'maxSelect' => 'nullable|integer|min:1',
        ]);

        try {
            $group = ModifierGroup::create($validated);
            return response()->json([
                'message' => 'Modifier group created successfully',
                'data' => arrayKeysToCamelCase($group->toArray())
            ], 201);
        } catch (Exception $err) {
            return response()->json(['error' => 'Failed to create modifier group'], 500);
        }
    }

    // Update modifier group
    public function updateGroup(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'isRequired' => 'nullable|boolean',
            'minSelect' => 'nullable|integer|min:0',
            'maxSelect' => 'nullable|integer|min:1',
            'isActive' => 'nullable|boolean',
        ]);

        try {
            $group = ModifierGroup::findOrFail($id);
            $group->update($validated);
            return response()->json([
                'message' => 'Modifier group updated successfully',
                'data' => arrayKeysToCamelCase($group->toArray())
            ], 200);
        } catch (Exception $err) {
            return response()->json(['error' => 'Failed to update modifier group'], 500);
        }
    }

    // Delete modifier group
    public function deleteGroup($id): JsonResponse
    {
        try {
            $group = ModifierGroup::findOrFail($id);
            $group->delete();
            return response()->json(['message' => 'Modifier group deleted successfully'], 200);
        } catch (Exception $err) {
            return response()->json(['error' => 'Failed to delete modifier group'], 500);
        }
    }

    // Get all modifiers
    public function getAllModifiers(): JsonResponse
    {
        try {
            $modifiers = ItemModifier::with('modifierGroup')
                ->where('isActive', true)
                ->orderBy('sortOrder')
                ->get();

            return response()->json(arrayKeysToCamelCase($modifiers->toArray()), 200);
        } catch (Exception $err) {
            return response()->json(['error' => 'Failed to fetch modifiers'], 500);
        }
    }

    // Create modifier
    public function createModifier(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'modifierGroupId' => 'required|exists:modifier_groups,id',
            'sortOrder' => 'nullable|integer',
        ]);

        try {
            $modifier = ItemModifier::create($validated);
            return response()->json([
                'message' => 'Modifier created successfully',
                'data' => arrayKeysToCamelCase($modifier->toArray())
            ], 201);
        } catch (Exception $err) {
            return response()->json(['error' => 'Failed to create modifier'], 500);
        }
    }

    // Update modifier
    public function updateModifier(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'modifierGroupId' => 'nullable|exists:modifier_groups,id',
            'sortOrder' => 'nullable|integer',
            'isActive' => 'nullable|boolean',
        ]);

        try {
            $modifier = ItemModifier::findOrFail($id);
            $modifier->update($validated);
            return response()->json([
                'message' => 'Modifier updated successfully',
                'data' => arrayKeysToCamelCase($modifier->toArray())
            ], 200);
        } catch (Exception $err) {
            return response()->json(['error' => 'Failed to update modifier'], 500);
        }
    }

    // Delete modifier
    public function deleteModifier($id): JsonResponse
    {
        try {
            $modifier = ItemModifier::findOrFail($id);
            $modifier->delete();
            return response()->json(['message' => 'Modifier deleted successfully'], 200);
        } catch (Exception $err) {
            return response()->json(['error' => 'Failed to delete modifier'], 500);
        }
    }

    // Assign modifier group to product
    public function assignToProduct(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'productId' => 'required|exists:product,id',
            'modifierGroupIds' => 'required|array',
            'modifierGroupIds.*' => 'exists:modifier_groups,id',
        ]);

        try {
            $product = \App\Models\Product::findOrFail($validated['productId']);
            $product->modifierGroups()->sync($validated['modifierGroupIds']);
            
            return response()->json([
                'message' => 'Modifier groups assigned to product successfully'
            ], 200);
        } catch (Exception $err) {
            return response()->json(['error' => 'Failed to assign modifier groups'], 500);
        }
    }

    // Get modifiers for a product
    public function getProductModifiers($productId): JsonResponse
    {
        try {
            $product = \App\Models\Product::with('modifierGroups.modifiers')->findOrFail($productId);
            return response()->json(arrayKeysToCamelCase($product->modifierGroups->toArray()), 200);
        } catch (Exception $err) {
            return response()->json(['error' => 'Product not found'], 404);
        }
    }
}
