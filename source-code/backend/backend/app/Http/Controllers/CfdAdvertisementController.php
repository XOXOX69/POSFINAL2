<?php

namespace App\Http\Controllers;

use App\Models\CfdAdvertisement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CfdAdvertisementController extends Controller
{
    // Get all advertisements (for admin)
    public function index()
    {
        $ads = CfdAdvertisement::orderBy('sort_order')->get();
        return response()->json($ads);
    }

    // Get active advertisements (for customer display)
    public function getActive()
    {
        $ads = CfdAdvertisement::where('is_active', true)
            ->orderBy('sort_order')
            ->get();
        return response()->json($ads);
    }

    // Create new advertisement
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'badge' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'price' => 'nullable|string|max:50',
            'media_type' => 'required|in:image,video,text',
            'duration' => 'nullable|integer|min:1000|max:60000',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        // Handle file upload
        if ($request->hasFile('media_file')) {
            $file = $request->file('media_file');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('cfd-ads', $filename, 'public');
            $validated['media_url'] = '/storage/' . $path;

            // Generate thumbnail for videos
            if ($validated['media_type'] === 'video') {
                $validated['thumbnail_url'] = $validated['media_url'];
            }
        }

        $ad = CfdAdvertisement::create($validated);

        return response()->json([
            'message' => 'Advertisement created successfully',
            'data' => $ad
        ], 201);
    }

    // Get single advertisement
    public function show($id)
    {
        $ad = CfdAdvertisement::findOrFail($id);
        return response()->json($ad);
    }

    // Update advertisement
    public function update(Request $request, $id)
    {
        $ad = CfdAdvertisement::findOrFail($id);

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'badge' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'price' => 'nullable|string|max:50',
            'media_type' => 'nullable|in:image,video,text',
            'duration' => 'nullable|integer|min:1000|max:60000',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        // Handle file upload
        if ($request->hasFile('media_file')) {
            // Delete old file
            if ($ad->media_url) {
                $oldPath = str_replace('/storage/', '', $ad->media_url);
                Storage::disk('public')->delete($oldPath);
            }

            $file = $request->file('media_file');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('cfd-ads', $filename, 'public');
            $validated['media_url'] = '/storage/' . $path;
        }

        $ad->update($validated);

        return response()->json([
            'message' => 'Advertisement updated successfully',
            'data' => $ad
        ]);
    }

    // Delete advertisement
    public function destroy($id)
    {
        $ad = CfdAdvertisement::findOrFail($id);

        // Delete associated file
        if ($ad->media_url) {
            $path = str_replace('/storage/', '', $ad->media_url);
            Storage::disk('public')->delete($path);
        }

        $ad->delete();

        return response()->json([
            'message' => 'Advertisement deleted successfully'
        ]);
    }

    // Update sort order
    public function updateOrder(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:cfd_advertisements,id',
            'items.*.sort_order' => 'required|integer',
        ]);

        foreach ($request->items as $item) {
            CfdAdvertisement::where('id', $item['id'])
                ->update(['sort_order' => $item['sort_order']]);
        }

        return response()->json([
            'message' => 'Sort order updated successfully'
        ]);
    }

    // Toggle active status
    public function toggleActive($id)
    {
        $ad = CfdAdvertisement::findOrFail($id);
        $ad->is_active = !$ad->is_active;
        $ad->save();

        return response()->json([
            'message' => 'Status updated successfully',
            'data' => $ad
        ]);
    }
}
