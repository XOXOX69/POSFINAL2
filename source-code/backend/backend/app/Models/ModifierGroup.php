<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ModifierGroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'isRequired',
        'minSelect',
        'maxSelect',
        'isActive',
    ];

    protected $casts = [
        'isRequired' => 'boolean',
        'isActive' => 'boolean',
    ];

    public function modifiers()
    {
        return $this->hasMany(ItemModifier::class, 'modifierGroupId');
    }

    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_modifier_groups', 'modifierGroupId', 'productId');
    }
}
