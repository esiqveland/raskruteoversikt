
export function create() {
  return [];
}

function dedupe(list, term) {
  const index = list.indexOf(term);
  if (index === -1) {
    return list;
  }
  
  return [
     ...list.slice(0, index),
     ...list.slice(index + 1)
  ];
}


export function add(MAX_LEN, list, term) {
  const uniques = dedupe(list, term);
  const added = [ term, ...uniques ];
  if (added.length > MAX_LEN) {
    return added.slice(0, -1);
  }
  return added;
}

export default class MRUList {
    constructor(aList = [], max_size = 15) {
        this.max_size = max_size;
        this.list = [ ...aList ];
    }

    add(item) {
        const next = add(this.max_size, this.list, item);
        return new MRUList(next, this.max_size);
    }
    get() {
        return this.list;
    }
    length() {
        return this.list.length;
    }
}

