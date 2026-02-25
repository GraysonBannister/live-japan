'use client';

import SaveToListButton from './SaveToListButton';
import { Property } from '../types/property';

interface PropertySaveButtonProps {
  property: Property;
  variant?: 'icon' | 'button';
}

export default function PropertySaveButton({ property, variant = 'button' }: PropertySaveButtonProps) {
  return (
    <SaveToListButton 
      propertyId={property.id}
      property={{
        id: property.id,
        location: property.location,
        price: property.price,
        photos: property.photos,
        type: property.type,
        nearestStation: property.nearestStation,
        walkTime: property.walkTime
      }}
      variant={variant}
    />
  );
}
