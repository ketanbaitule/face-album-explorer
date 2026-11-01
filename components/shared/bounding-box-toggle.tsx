"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface BoundingBoxToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function BoundingBoxToggle({
  checked,
  onCheckedChange,
}: BoundingBoxToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <Switch
        id="show-bounding-boxes"
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      <Label htmlFor="show-bounding-boxes" className="cursor-pointer text-sm">
        Show bounding boxes
      </Label>
    </div>
  );
}
