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
    return [
      ...acc.filter((o) => o.name !== parent),
      {
        name: parent,
        isGroup: true,
        data: [
          ...((acc.find((o) => o.name === parent)?.data as Array<{
            name: string;
            data: Data;
          }>) ?? []),
          { name: child, data: value }
        ]
      }
    ];
  }, [] as { name: string; isGroup: boolean; data: Array<{ name: string; data: Data }> | Data }[]);
}
