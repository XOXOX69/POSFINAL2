<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ItemModifier extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'isActive',
        'sortOrder',
        'modifierGroupId',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'isActive' => 'boolean',
    ];

    public function modifierGroup()
    {
        return $this->belongsTo(ModifierGroup::class, 'modifierGroupId');
    }

    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_modifiers', 'itemModifierId', 'productId');
    }
}
