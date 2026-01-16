<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CashDrawer extends Model
{
    use HasFactory;

    protected $fillable = [
        'userId',
        'openingAmount',
        'closingAmount',
        'expectedAmount',
        'difference',
        'openedAt',
        'closedAt',
        'status', // 'open', 'closed'
        'notes',
    ];

    protected $casts = [
        'openingAmount' => 'decimal:2',
        'closingAmount' => 'decimal:2',
        'expectedAmount' => 'decimal:2',
        'difference' => 'decimal:2',
        'openedAt' => 'datetime',
        'closedAt' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'userId');
    }

    public function transactions()
    {
        return $this->hasMany(CashDrawerTransaction::class, 'cashDrawerId');
    }
}
