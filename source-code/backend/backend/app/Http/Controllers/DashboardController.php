<?php

namespace App\Http\Controllers;
//

use App\Models\AppSetting;
use App\Models\Customer;
use App\Models\PurchaseInvoice;
use App\Models\SaleInvoice;
use App\Models\Users;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Traits\StoreFilterTrait;

class DashboardController extends Controller
{
    use StoreFilterTrait;
    public function getDashboardData(Request $request): JsonResponse
    {
        try {
            // Get storeId for filtering - returns null for All Branches mode
            $storeId = $this->getStoreId($request);
            
            $appData = AppSetting::first();
            if (!$appData) {
                return response()->json(['error' => 'App settings not found'], 404);
            }
            if (!in_array($appData->dashboardType, ['inventory', 'e-commerce', 'both'])) {
                return response()->json(['error' => 'Invalid dashboard type'], 400);
            }

            if ($appData->dashboardType === 'inventory') {

                $allSaleInvoices = SaleInvoice::when($storeId !== null, function ($query) use ($storeId) {
                    return $query->where('storeId', $storeId);
                })
                    ->when($request->query('startDate') && $request->query('endDate'), function ($query) use ($request) {
                        return $query->where('date', '>=', Carbon::createFromFormat('Y-m-d', $request->query('startDate')))
                            ->where('date', '<=', Carbon::createFromFormat('Y-m-d', $request->query('endDate')));
                    })
                    ->groupBy('date')
                    ->orderBy('date', 'desc')
                    ->selectRaw('COUNT(id) as countedId, SUM(totalAmount) as totalAmount, SUM(paidAmount) as paidAmount, SUM(dueAmount) as dueAmount, SUM(profit) as profit, date')
                    ->get();

                $totalSaleInvoice = SaleInvoice::when($storeId !== null, function ($query) use ($storeId) {
                    return $query->where('storeId', $storeId);
                })
                    ->when($request->query('startDate') && $request->query('endDate'), function ($query) use ($request) {
                        return $query->where('date', '>=', Carbon::createFromFormat('Y-m-d', $request->query('startDate')))
                            ->where('date', '<=', Carbon::createFromFormat('Y-m-d', $request->query('endDate')));
                    })->count();

                $allPurchaseInvoice = PurchaseInvoice::when($storeId !== null, function ($query) use ($storeId) {
                    return $query->where('storeId', $storeId);
                })
                    ->when($request->query('startDate') && $request->query('endDate'), function ($query) use ($request) {
                        return $query->where('date', '>=', Carbon::createFromFormat('Y-m-d', $request->query('startDate')))
                            ->where('date', '<=', Carbon::createFromFormat('Y-m-d', $request->query('endDate')));
                    })
                    ->groupBy('date')
                    ->orderBy('date', 'desc')
                    ->selectRaw('COUNT(id) as countedId, SUM(totalAmount) as totalAmount,SUM(dueAmount) as dueAmount, SUM(paidAmount) as paidAmount, date')
                    ->get();

                $totalPurchaseInvoice = PurchaseInvoice::when($storeId !== null, function ($query) use ($storeId) {
                    return $query->where('storeId', $storeId);
                })
                    ->when($request->query('startDate') && $request->query('endDate'), function ($query) use ($request) {
                        return $query->where('date', '>=', Carbon::createFromFormat('Y-m-d', $request->query('startDate')))
                            ->where('date', '<=', Carbon::createFromFormat('Y-m-d', $request->query('endDate')));
                    });

                $totalPurchaseInvoice = $totalPurchaseInvoice->count();


                //total sale and total purchase amount is calculated by subtracting total discount from total amount (saiyed)
                $cartInfo = [
                    'totalSaleInvoice' => $totalSaleInvoice,
                    'totalSaleAmount' => $allSaleInvoices->sum('totalAmount'),
                    'totalSaleDue' => $allSaleInvoices->sum('dueAmount'),
                    'totalPurchaseInvoice' => $totalPurchaseInvoice,
                    'totalPurchaseAmount' => $allPurchaseInvoice->sum('totalAmount'),
                    'totalPurchaseDue' => $allPurchaseInvoice->sum('dueAmount')
                ];
                return response()->json($cartInfo, 200);

            } else if ($appData->dashboardType === 'both') {

                $allSaleInvoice = SaleInvoice::when($request->query('startDate') && $request->query('endDate'), function ($query) use ($request) {
                    return $query->where('date', '>=', Carbon::createFromFormat('Y-m-d', $request->query('startDate')))
                        ->where('date', '<=', Carbon::createFromFormat('Y-m-d', $request->query('endDate')));
                })
                    ->groupBy('date')
                    ->orderBy('date', 'desc')
                    ->selectRaw('COUNT(id) as countedId, SUM(totalAmount) as totalAmount, SUM(paidAmount) as paidAmount, SUM(dueAmount) as dueAmount, SUM(profit) as profit, date')
                    ->get();

                $allPurchaseInvoice = PurchaseInvoice::when($request->query('startDate') && $request->query('endDate'), function ($query) use ($request) {
                    return $query->where('date', '>=', Carbon::createFromFormat('Y-m-d', $request->query('startDate')))
                        ->where('date', '<=', Carbon::createFromFormat('Y-m-d', $request->query('endDate')));
                })
                    ->groupBy('date')
                    ->orderBy('date', 'desc')
                    ->selectRaw('COUNT(id) as countedId, SUM(totalAmount) as totalAmount, SUM(dueAmount) as dueAmount, SUM(paidAmount) as paidAmount, date')
                    ->get();

                // $totalPurchaseInvoice = PurchaseInvoice::when($request->query('startDate') && $request->query('endDate'), function ($query) use ($request) {
                //     return $query->where('date', '>=', Carbon::createFromFormat('Y-m-d', $request->query('startDate')))
                //         ->where('date', '<=', Carbon::createFromFormat('Y-m-d', $request->query('endDate')));
                // })
                //     ->groupBy('date')
                //     ->orderBy('date', 'desc')
                //     ->selectRaw('COUNT(id) as countedId, SUM(totalAmount) as totalAmount, SUM(dueAmount) as dueAmount, SUM(paidAmount) as paidAmount, date')
                //     ->count();

                $totalPurchaseInvoice = PurchaseInvoice::when($request->query('startDate') && $request->query('endDate'), function ($query) use ($request) {
                    return $query->where('date', '>=', Carbon::createFromFormat('Y-m-d', $request->query('startDate')))
                        ->where('date', '<=', Carbon::createFromFormat('Y-m-d', $request->query('startDate')));
                })->count();


                $totalSaleInvoice = SaleInvoice::when($request->query('startDate') && $request->query('endDate'), function ($query) use ($request) {
                    return $query->where('date', '>=', Carbon::createFromFormat('Y-m-d', $request->query('startDate')))
                        ->where('date', '<=', Carbon::createFromFormat('Y-m-d', $request->query('endDate')));
                })
                    ->groupBy('date')
                    ->orderBy('date', 'desc')
                    ->selectRaw('COUNT(id) as countedId, SUM(totalAmount) as totalAmount, SUM(paidAmount) as paidAmount, SUM(dueAmount) as dueAmount, SUM(profit) as profit, date')
                    ->count();


                $cardInfo = [
                    'totalPurchaseInvoice' => $totalPurchaseInvoice,
                    'totalPurchaseAmount' => $allPurchaseInvoice->sum('totalAmount'),
                    'totalPurchaseDue' => $allPurchaseInvoice->sum('dueAmount'),
                ];

                return response()->json($cardInfo, 200);
            } else {
                return response()->json(['error' => 'Invalid dashboard type'], 400);
            }
        } catch (Exception $err) {
            return response()->json(['error' => $err->getMessage()], 500);
        }
    }

    public function getChartData(Request $request): JsonResponse
    {
        try {
            // Get monthly sales and purchase data for the last 12 months
            $months = [];
            $salesData = [];
            $purchaseData = [];
            $salesDueData = [];
            $purchaseDueData = [];

            for ($i = 11; $i >= 0; $i--) {
                $date = Carbon::now()->subMonths($i);
                $startOfMonth = $date->copy()->startOfMonth();
                $endOfMonth = $date->copy()->endOfMonth();
                
                $months[] = $date->format('M');

                // Get sales for this month
                $monthlySales = SaleInvoice::whereBetween('date', [$startOfMonth, $endOfMonth])
                    ->selectRaw('COALESCE(SUM(totalAmount), 0) as total, COALESCE(SUM(dueAmount), 0) as due, COALESCE(SUM(paidAmount), 0) as paid')
                    ->first();

                $salesData[] = (float) ($monthlySales->total ?? 0);
                $salesDueData[] = (float) ($monthlySales->due ?? 0);

                // Get purchases for this month
                $monthlyPurchases = PurchaseInvoice::whereBetween('date', [$startOfMonth, $endOfMonth])
                    ->selectRaw('COALESCE(SUM(totalAmount), 0) as total, COALESCE(SUM(dueAmount), 0) as due, COALESCE(SUM(paidAmount), 0) as paid')
                    ->first();

                $purchaseData[] = (float) ($monthlyPurchases->total ?? 0);
                $purchaseDueData[] = (float) ($monthlyPurchases->due ?? 0);
            }

            // Get recent activity (last 20 transactions count per hour for real-time chart)
            $recentActivity = [];
            for ($i = 19; $i >= 0; $i--) {
                $hourStart = Carbon::now()->subHours($i);
                $hourEnd = Carbon::now()->subHours($i - 1);
                
                $salesCount = SaleInvoice::whereBetween('created_at', [$hourStart, $hourEnd])->count();
                $purchaseCount = PurchaseInvoice::whereBetween('created_at', [$hourStart, $hourEnd])->count();
                
                $recentActivity[] = $salesCount + $purchaseCount;
            }

            // Revenue distribution by payment status
            $totalSales = SaleInvoice::selectRaw('COALESCE(SUM(paidAmount), 0) as paid, COALESCE(SUM(dueAmount), 0) as due')
                ->first();
            
            $revenueDistribution = [
                'paid' => (float) ($totalSales->paid ?? 0),
                'due' => (float) ($totalSales->due ?? 0),
            ];

            // Get last 6 months revenue for bar chart
            $last6MonthsLabels = [];
            $last6MonthsRevenue = [];
            
            for ($i = 5; $i >= 0; $i--) {
                $date = Carbon::now()->subMonths($i);
                $startOfMonth = $date->copy()->startOfMonth();
                $endOfMonth = $date->copy()->endOfMonth();
                
                $last6MonthsLabels[] = $date->format('M');
                
                $monthRevenue = SaleInvoice::whereBetween('date', [$startOfMonth, $endOfMonth])
                    ->sum('paidAmount');
                
                $last6MonthsRevenue[] = (float) ($monthRevenue ?? 0);
            }

            // Today's stats for real-time display
            $today = Carbon::today();
            $todaySales = SaleInvoice::whereDate('date', $today)
                ->selectRaw('COUNT(*) as count, COALESCE(SUM(totalAmount), 0) as total')
                ->first();
            
            $todayPurchases = PurchaseInvoice::whereDate('date', $today)
                ->selectRaw('COUNT(*) as count, COALESCE(SUM(totalAmount), 0) as total')
                ->first();

            return response()->json([
                'months' => $months,
                'salesData' => $salesData,
                'purchaseData' => $purchaseData,
                'salesDueData' => $salesDueData,
                'purchaseDueData' => $purchaseDueData,
                'recentActivity' => $recentActivity,
                'revenueDistribution' => $revenueDistribution,
                'last6MonthsLabels' => $last6MonthsLabels,
                'last6MonthsRevenue' => $last6MonthsRevenue,
                'todayStats' => [
                    'salesCount' => (int) ($todaySales->count ?? 0),
                    'salesTotalAmount' => (float) ($todaySales->total ?? 0),
                    'purchasesCount' => (int) ($todayPurchases->count ?? 0),
                    'purchasesTotalAmount' => (float) ($todayPurchases->total ?? 0),
                ]
            ], 200);

        } catch (Exception $err) {
            return response()->json(['error' => $err->getMessage()], 500);
        }
    }

    public function getActiveUsers(Request $request): JsonResponse
    {
        try {
            // Get storeId for filtering - returns null for All Branches mode
            $storeId = $this->getStoreId($request);
            
            $activeUsers = Users::where('isLogin', 'true')
                ->where('status', 'true')
                ->when($storeId !== null, function ($query) use ($storeId) {
                    return $query->where('storeId', $storeId);
                })
                ->with(['role:id,name', 'store:id,name,code', 'designationHistory' => function($query) {
                    $query->with('designation:id,name')->latest()->limit(1);
                }])
                ->select('id', 'firstName', 'lastName', 'username', 'email', 'image', 'roleId', 'storeId', 'updated_at')
                ->orderBy('updated_at', 'desc')
                ->get();

            $activeUsers->transform(function ($user) {
                $designation = $user->designationHistory->first()?->designation?->name ?? null;
                return [
                    'id' => $user->id,
                    'firstName' => $user->firstName,
                    'lastName' => $user->lastName,
                    'username' => $user->username,
                    'email' => $user->email,
                    'image' => $user->image,
                    'role' => $user->role?->name,
                    'store' => $user->store ? [
                        'id' => $user->store->id,
                        'name' => $user->store->name,
                        'code' => $user->store->code,
                    ] : null,
                    'designation' => $designation,
                    'loginTime' => $user->updated_at,
                ];
            });

            return response()->json([
                'activeUsers' => $activeUsers,
                'totalActive' => $activeUsers->count(),
            ], 200);

        } catch (Exception $err) {
            return response()->json(['error' => $err->getMessage()], 500);
        }
    }
}
