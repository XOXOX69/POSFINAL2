<?php

namespace App\Http\Controllers;

use App\Models\CashDrawer;
use App\Models\CashDrawerTransaction;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CashDrawerController extends Controller
{
    // Get current open drawer for user
    public function getCurrentDrawer(): JsonResponse
    {
        try {
            $userId = auth()->id();
            $drawer = CashDrawer::with('transactions')
                ->where('userId', $userId)
                ->where('status', 'open')
                ->first();

            if (!$drawer) {
                return response()->json(['message' => 'No open drawer found', 'data' => null], 200);
            }

            // Calculate current balance
            $balance = $this->calculateDrawerBalance($drawer);
            $drawerData = $drawer->toArray();
            $drawerData['currentBalance'] = $balance;

            return response()->json(['data' => arrayKeysToCamelCase($drawerData)], 200);
        } catch (Exception $err) {
            return response()->json(['error' => 'Failed to fetch drawer'], 500);
        }
    }

    // Open a new cash drawer
    public function openDrawer(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'openingAmount' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        try {
            $userId = auth()->id();

            // Check if user already has an open drawer
            $existingDrawer = CashDrawer::where('userId', $userId)
                ->where('status', 'open')
                ->first();

            if ($existingDrawer) {
                return response()->json(['error' => 'You already have an open drawer. Please close it first.'], 400);
            }

            $drawer = CashDrawer::create([
                'userId' => $userId,
                'openingAmount' => $validated['openingAmount'],
                'notes' => $validated['notes'] ?? null,
                'openedAt' => now(),
                'status' => 'open',
            ]);

            return response()->json([
                'message' => 'Cash drawer opened successfully',
                'data' => arrayKeysToCamelCase($drawer->toArray())
            ], 201);
        } catch (Exception $err) {
            return response()->json(['error' => 'Failed to open drawer'], 500);
        }
    }

    // Close cash drawer
    public function closeDrawer(Request $request, $id): JsonResponse
    {
        $validated = $request->validate([
            'closingAmount' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $drawer = CashDrawer::findOrFail($id);
            
            if ($drawer->status === 'closed') {
                return response()->json(['error' => 'Drawer is already closed'], 400);
            }

            $expectedAmount = $this->calculateDrawerBalance($drawer);
            $difference = $validated['closingAmount'] - $expectedAmount;

            $drawer->update([
                'closingAmount' => $validated['closingAmount'],
                'expectedAmount' => $expectedAmount,
                'difference' => $difference,
                'closedAt' => now(),
                'status' => 'closed',
                'notes' => $validated['notes'] ?? $drawer->notes,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Cash drawer closed successfully',
                'data' => arrayKeysToCamelCase($drawer->toArray())
            ], 200);
        } catch (Exception $err) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to close drawer'], 500);
        }
    }

    // Cash in
    public function cashIn(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'reason' => 'required|string|max:255',
            'notes' => 'nullable|string',
        ]);

        try {
            $userId = auth()->id();
            $drawer = CashDrawer::where('userId', $userId)
                ->where('status', 'open')
                ->first();

            if (!$drawer) {
                return response()->json(['error' => 'No open drawer found. Please open a drawer first.'], 400);
            }

            $transaction = CashDrawerTransaction::create([
                'cashDrawerId' => $drawer->id,
                'userId' => $userId,
                'type' => 'cash_in',
                'amount' => $validated['amount'],
                'reason' => $validated['reason'],
                'notes' => $validated['notes'] ?? null,
            ]);

            return response()->json([
                'message' => 'Cash in recorded successfully',
                'data' => arrayKeysToCamelCase($transaction->toArray()),
                'currentBalance' => $this->calculateDrawerBalance($drawer)
            ], 201);
        } catch (Exception $err) {
            return response()->json(['error' => 'Failed to record cash in'], 500);
        }
    }

    // Cash out
    public function cashOut(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'reason' => 'required|string|max:255',
            'notes' => 'nullable|string',
        ]);

        try {
            $userId = auth()->id();
            $drawer = CashDrawer::where('userId', $userId)
                ->where('status', 'open')
                ->first();

            if (!$drawer) {
                return response()->json(['error' => 'No open drawer found'], 400);
            }

            $currentBalance = $this->calculateDrawerBalance($drawer);
            if ($validated['amount'] > $currentBalance) {
                return response()->json(['error' => 'Insufficient cash in drawer'], 400);
            }

            $transaction = CashDrawerTransaction::create([
                'cashDrawerId' => $drawer->id,
                'userId' => $userId,
                'type' => 'cash_out',
                'amount' => $validated['amount'],
                'reason' => $validated['reason'],
                'notes' => $validated['notes'] ?? null,
            ]);

            return response()->json([
                'message' => 'Cash out recorded successfully',
                'data' => arrayKeysToCamelCase($transaction->toArray()),
                'currentBalance' => $this->calculateDrawerBalance($drawer)
            ], 201);
        } catch (Exception $err) {
            return response()->json(['error' => 'Failed to record cash out'], 500);
        }
    }

    // Record a sale transaction
    public function recordSale(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'referenceId' => 'required|integer',
        ]);

        try {
            $userId = auth()->id();
            $drawer = CashDrawer::where('userId', $userId)
                ->where('status', 'open')
                ->first();

            if (!$drawer) {
                // If no drawer open, just return success (drawer tracking is optional)
                return response()->json(['message' => 'Sale recorded (no drawer open)'], 200);
            }

            $transaction = CashDrawerTransaction::create([
                'cashDrawerId' => $drawer->id,
                'userId' => $userId,
                'type' => 'sale',
                'amount' => $validated['amount'],
                'referenceId' => $validated['referenceId'],
                'referenceType' => 'sale',
            ]);

            return response()->json([
                'message' => 'Sale recorded in drawer',
                'data' => arrayKeysToCamelCase($transaction->toArray())
            ], 201);
        } catch (Exception $err) {
            return response()->json(['error' => 'Failed to record sale'], 500);
        }
    }

    // Get drawer history
    public function getDrawerHistory(Request $request): JsonResponse
    {
        try {
            $userId = auth()->id();
            $pagination = getPagination($request->query());
            
            $query = CashDrawer::with(['transactions', 'user'])
                ->orderBy('created_at', 'desc');

            // Date filtering
            if ($request->has('startDate')) {
                $query->whereDate('created_at', '>=', $request->startDate);
            }
            if ($request->has('endDate')) {
                $query->whereDate('created_at', '<=', $request->endDate);
            }

            // Allow admin to see all, otherwise filter by user
            if (!auth()->user()?->hasRole('admin')) {
                $query->where('userId', $userId);
            }

            $drawers = $query->skip($pagination['skip'])
                ->take($pagination['limit'])
                ->get();

            $total = (clone $query)->count();

            // Calculate stats
            $allDrawers = (clone $query)->get();
            $stats = [
                'totalSessions' => $allDrawers->count(),
                'totalCashIn' => $allDrawers->flatMap->transactions->where('type', 'cash_in')->sum('amount'),
                'totalCashOut' => $allDrawers->flatMap->transactions->where('type', 'cash_out')->sum('amount'),
                'totalSales' => $allDrawers->flatMap->transactions->where('type', 'sale')->sum('amount'),
                'avgDiscrepancy' => $allDrawers->where('status', 'closed')->avg('difference') ?? 0,
            ];

            return response()->json([
                'data' => [
                    'drawers' => arrayKeysToCamelCase($drawers->toArray()),
                    'stats' => $stats,
                ],
                'total' => $total
            ], 200);
        } catch (Exception $err) {
            return response()->json(['error' => 'Failed to fetch drawer history'], 500);
        }
    }

    // Get single drawer details
    public function getDrawer($id): JsonResponse
    {
        try {
            $drawer = CashDrawer::with(['transactions', 'user'])->findOrFail($id);
            
            // Security check
            if (!auth()->user()?->hasRole('admin') && $drawer->userId !== auth()->id()) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            return response()->json([
                'data' => arrayKeysToCamelCase($drawer->toArray())
            ], 200);
        } catch (Exception $err) {
            return response()->json(['error' => 'Drawer not found'], 404);
        }
    }

    // Get drawer transactions
    public function getDrawerTransactions($id): JsonResponse
    {
        try {
            $transactions = CashDrawerTransaction::where('cashDrawerId', $id)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json(arrayKeysToCamelCase($transactions->toArray()), 200);
        } catch (Exception $err) {
            return response()->json(['error' => 'Failed to fetch transactions'], 500);
        }
    }

    // Helper: Calculate current drawer balance
    private function calculateDrawerBalance(CashDrawer $drawer): float
    {
        $opening = (float) $drawer->openingAmount;
        
        $cashIn = CashDrawerTransaction::where('cashDrawerId', $drawer->id)
            ->whereIn('type', ['cash_in', 'sale'])
            ->sum('amount');
        
        $cashOut = CashDrawerTransaction::where('cashDrawerId', $drawer->id)
            ->whereIn('type', ['cash_out', 'refund'])
            ->sum('amount');

        return $opening + (float)$cashIn - (float)$cashOut;
    }
}
