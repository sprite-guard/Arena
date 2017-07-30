var Cantor = {
    pair: (a,b) => {
        return ((0.5)*(a+b)*(a+b+1))+b;
    },
    unpair: z => {
        var w = Math.floor((Math.sqrt(8*z + 1)-1)/2),
            t = ((w*w)+w)/2,
            y = z - t,
            x = w - y;
        return [x,y];
    }
};