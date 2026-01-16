<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CashDrawerTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'cashDrawerId',
        'userId',
        'type', // 'cash_in', 'cash_out', 'sale', 'refund'
        'amount',
        'reason',
        'referenceId', // sale invoice id if applicable
        'referenceType', // 'sale', 'refund', 'manual'
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function cashDrawer()
    {
        return $this->belongsTo(CashDrawer::class, 'cashDrawerId');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'userId');
    }
}
