describe('Test etc', () => {
  it('Test reg', () => {
    const abc = 'a+b@bc.com 입니다.';
    const resutl = abc.search(/^[a-zA-Z0-9+-_.]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+/);
    console.log(resutl);

    const x = '나는 *학색*입니다. *정말*';
    const l = x.search(/\*(.*)\*/);
    console.log(l);

    const r = 'abc *efghi* jk *zz* xx'.split(/(^|[^\*])\*(?!\*)(.*?[^\*])\*(?!\*)/g);
    console.log(r);
    const r2 = 'abc *efghi j*k *zz* xx'.split(/(^|[^\*])\*(?!\*)(.*?[^\*])\*(?!\*)/g);
    console.log(r2);

    const r3 = 'abc **efghi** jk **zz** xx'.split(/(^|[^\*])\*\*(?!\*)(.*?[^\*])\*\*(?!\*)/g);
    console.log(r3);
  });
});
