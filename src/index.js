var GuineaPig = (function() {
    'use strict';

    var init = function(name, variants) {
        var test = name.toToken(),
            experiments = variants,
            experiment = null;

        return new Promise( function ( resolve, reject ) {
            if ( get( 'guineapig_'+ test ) ) {
                experiment = experiments[ parseInt( get( 'guineapig_'+ test ) ) ];
                experiment['token'] = experiment.name.toToken();
                return resolve ( experiment );
            } else {
                http( test ).then( function ( resp ) {
                    set( 'guineapig_'+ resp.experiment, resp.variant );
                    experiment = experiments[ parseInt( resp.variant ) ];
                    experiment['token'] = experiment.name.toToken();
                    return resolve ( experiment );
                }).catch( function ( reason ) {
                    // console.log( reason );
                    return reject ( reason );
                });
            }
        });
    };

    var http = function ( experiment ) {
        return new Promise ( function ( resolve, reject ) {
            var xhr = new XMLHttpRequest();
                xhr.open( 'GET', '/distribution/'+ experiment );
                xhr.send();
                xhr.onload = function () {
                    // console.log( 'loading' );
                    if ( this.status >= 200 && this.status < 300 ) {
                        resolve( JSON.parse( this.response ) );
                    } else {
                        reject( this.statusText );
                    }
                };
                xhr.onerror = function () {
                    reject( this.statusText );
                };
        });
    };

    var get = function(key) {
        var val = [],
            cookie = document.cookie.split(';') || [],
            name = RegExp("^\\s*"+ key +"=\\s*(.*?)\\s*$");
        for (var i = 0; i < cookie.length; i++) {
            var f = cookie[i].match(name);
                f&&val.push(f[1]);
        }
        return val.pop();
    };

    var set = function(k, v, d, p) {
        var key = k,
            val = v,
            days = d || 1,
            path = p || '/',
            expires = '',
            date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires='+ date.toGMTString();

        document.cookie = key +'='+ val + expires  +'; path='+ path;
    };

    var del = function() {
        set(this.test, '', -1);
    };

    String.prototype.toToken = function() {
        return this.toLowerCase().replace(/[^a-z0-9]/g, '_');
    };

    return {
        experiment: init,
        reset: del
    }
})();

module.exports = GuineaPig;
