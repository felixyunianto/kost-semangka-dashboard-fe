import type { TRoomInventory } from "@/lib/entities";

const INVENTORY_ICON_RULES: { test: RegExp; icon: string }[] = [
  { test: /ac|air\s?cond|panasonic|pendingin/, icon: "solar:snowflake-linear" },
  { test: /tv|televisi|led/, icon: "solar:tv-linear" },
  { test: /kasur|bed|springbed|sofa/, icon: "solar:bed-linear" },
  { test: /kunci|lock|pintu|door/, icon: "solar:lock-keyhole-linear" },
  { test: /tembok|dinding|wall/, icon: "solar:box-linear" },
  { test: /kipas|fan/, icon: "solar:wind-linear" },
  { test: /meja|desk|table/, icon: "solar:chair-linear" },
  { test: /kursi|chair/, icon: "solar:chair-linear" },
  { test: /lemari|wardrobe|closet/, icon: "solar:closet-linear" },
  { test: /wifi|router/, icon: "solar:wi-fi-router-linear" },
  { test: /lampu|lamp|light/, icon: "solar:lamp-linear" },
  { test: /mandi|shower|toilet/, icon: "solar:bath-linear" },
  { test: /jendela|window/, icon: "solar:window-frame-linear" },
  { test: /kulkas|fridge|refrigerator/, icon: "solar:fridge-linear" },
  { test: /dispenser|galon/, icon: "solar:waterdrop-linear" },
];

export const getInventoryIcon = (name: string) => {
  const value = name.toLowerCase();

  return (
    INVENTORY_ICON_RULES.find((rule) => rule.test.test(value))?.icon ??
    "solar:box-minimalistic-linear"
  );
};

export const isInventoryRepairing = (item: Pick<TRoomInventory, "status">) => {
  return item.status === "REPAIRING";
};

export const applyInventoryHealth = (
  item: TRoomInventory,
  needsRepair: boolean,
): TRoomInventory => {
  return {
    ...item,
    condition: needsRepair ? "POOR" : "GOOD",
    status: needsRepair ? "REPAIRING" : "FUNCTIONAL",
  };
};
