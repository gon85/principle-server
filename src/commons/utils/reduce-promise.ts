/* eslint-disable max-len */
type SingleCallback<T, R> = (el: T, i: number, arr: T[]) => Promise<R>;
type MultiCallback<T, R> = (el: T[], i: [number, number], arr: T[]) => Promise<R[]>;

/**
 * @param {*[]} array 대상 배열
 * @param {function} callback 콜백함수
 * @param {number} size 순차실행 분할시 동시에 실행되는 갯수 (기본값 = 1)
 * @param {boolean} useArray 분할된 배열을 콜백에 직접 인자로 줄지 (기본값 = false (하나씩 줌))
 */
function reducePromises<T, R = T | void>(
  array: T[],
  callback: SingleCallback<T, R>,
  size?: number,
  useArray?: false,
): Promise<R[]>;
function reducePromises<T, R = T | void>(
  array: T[],
  callback: MultiCallback<T, R>,
  size?: number,
  useArray?: true,
): Promise<R[]>;
function reducePromises<T, R = T | void>(
  array: T[],
  callback: SingleCallback<T, R> | MultiCallback<T, R>,
  size = 1,
  useArray = false,
): Promise<R[]> {
  const { length } = array;
  const offsets = Array(Math.ceil(length / size))
    .fill(null)
    .map((_, i) => i * size);
  return offsets.reduce<Promise<R[]>>(async (promise, from) => {
    const acc = await promise;
    const to = Math.min(from + size, length);
    const currentElements = array.slice(from, to);

    const currentResults = useArray
      ? await (callback as MultiCallback<T, R>)(currentElements, [from, to], array)
      : await Promise.all<R>(currentElements.map((e, i) => (callback as SingleCallback<T, R>)(e, from + i, array)));
    return acc.concat(currentResults);
  }, Promise.resolve([]));
}

export default reducePromises;
