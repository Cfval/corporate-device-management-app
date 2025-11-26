import { LineStatusES, DeviceStatusES, ClientStatusES, DeviceTypeES, UserStatusES } from "./statusTranslations.ts";

export const translate = (category: string, value: string): string => {
  const maps: Record<string, Record<string, string>> = {
    line: LineStatusES,
    device: DeviceStatusES,
    client: ClientStatusES,
    type: DeviceTypeES,
    user: UserStatusES,
  };

  return maps[category]?.[value] ?? value;
};
