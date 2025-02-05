import {v7} from "uuid";

type ImageData = {
    data: number[];
    format: string;
}

type DepotItem = {
    type: 'path' | 'blob';
    data: string | ImageData;
}

export class Depot {
    depot: Map<string, DepotItem> = new Map();

    depotAdd(data: string | ImageData, type: 'path' | 'blob' = 'path') : string {
        const uuid = v7();
        this.depot.set(uuid, {
            type,
            data
        });
        return uuid;
    }

    getDepotUUID(path: string) : string | undefined {
        for (const [uuid, item] of this.depot.entries()) {
            if (item.type === 'path' && item.data === path) {
                return uuid;
            }
        }
        return undefined;
    }

    getDepotItem(uuid: string) : DepotItem | undefined {
        return this.depot.get(uuid);
    }

    getDepotPath(uuid: string) : string | undefined {
        const item = this.depot.get(uuid);
        if (item?.type === 'path') {
            return item.data as string;
        }
        return undefined;
    }
}

