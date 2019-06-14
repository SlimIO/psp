declare namespace psp {
    interface count {
        crit: number;
        warn: number;
    }
}

declare function psp(forceMode?: boolean): Promise<psp.count>;

export = psp;
export as namespace psp;
