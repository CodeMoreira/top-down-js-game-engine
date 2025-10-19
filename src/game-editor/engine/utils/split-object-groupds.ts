export function splitObjectGroups<Data>(obj: Record<string, any>): Array<{
  name: string;
  isGroup: boolean;
  data: Array<{ name: string; data: Data }> | Data;
}> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (!key.includes("/")) {
      return [...acc, { name: key, isGroup: false, data: value }];
    }

    const [parent, child] = key.split("/");
    const parentData = acc.find((o) => o.name === parent)?.data as Array<{
      name: string;
      data: Data;
    }>;
    const normalizedParentData = !parentData
      ? []
      : Array.isArray(parentData)
      ? parentData
      : [{ name: "default", data: parentData }];

    return [
      ...acc.filter((o) => o.name !== parent),
      {
        name: parent,
        isGroup: true,
        data: [...normalizedParentData, { name: child, data: value }]
      }
    ];
  }, [] as { name: string; isGroup: boolean; data: Array<{ name: string; data: Data }> | Data }[]);
}
