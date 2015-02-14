Array.prototype.partialSearch = function ( string ) {
	var result_array = [];
	for ( var i = 0; i < this.length; ++ i ) {
		if ( this[i].indexOf ( string ) == 0 ) result_array.push ( i );
	}
	if ( result_array.length > 0 ) return result_array;
	return -1;
};

jQuery ( document )	.ready ( function () {
	
	//Get JSON 
	var currJSON = [];
	var keys = [];
	var base = 'USD', prevBase = '', baseRate = 1;
	var rates = [];
	var inLoop = 0;
	
	var multCurr = ['INR'];
	//https://gist.githubusercontent.com/Fluidbyte/2973986/raw/9ead0f85b6ee6071d018564fa5a314a0297212cc/Common-Currency.json
	jQuery .getJSON ( "https://gist.githubusercontent.com/Fluidbyte/2973986/raw/9ead0f85b6ee6071d018564fa5a314a0297212cc/Common-Currency.json", function ( data ) {
		jQuery	.each ( data, function ( key, value ) {
			currJSON [ key ] = value;
			keys.push ( key );
			//console.log ( currJSON [ key ] );
		});
	});
	
	jQuery	.ajax({
		url: 'https://openexchangerates.org/api/latest.json?app_id=25c63664ec5a46a0abe77c2ab9a8825d',
		dataType: 'jsonp',
		success: function(json) {
			rates = json.rates;
		}
	});
	
	
	jQuery ( ".input-text" )	.keyup ( function () {
		var val = jQuery	.trim ( jQuery ( this ) .val () );
		val = val.toUpperCase();
		if ( val !== '' ) {
			var indices = keys.partialSearch ( val );
			/*for ( var index in indices ) {
				var k = keys [ indices [index] ];
				if ( k !== undefined ) {
					//console.log ( 'Key: ' + k + ' Value: ' + currJSON [ k ] )
				}
			}*/
			currSuggestions ( indices, 'P' );
		}
	});
	
	removeSugg = function () {
		jQuery ( '.ex-suggestions' )	.remove ();
	};
	
	currSuggestions  = function ( arr, type ) {
		removeSugg ();
		
		var id = '';
		
		if ( type === 'P' ) {
			id = 'ex-prim-curr';
			removeCurrencyInput ();
		}
		else if ( type === 'M' ) {
			id = 'ex-mult-curr';
		}
		
		jQuery ( '<div class="ex-suggestions"><div>' )	.appendTo ( jQuery ( '#' + id ) );
		
		$parent = jQuery ( '.ex-suggestions' );
		var classes = [ 'ex-odd', 'ex-even' ];
		for ( var i in arr ) {
			var k = keys [ arr [i] ];
			if ( k !== undefined ) {
				var name = currJSON [ k ].name;
				var symbol = currJSON [ k ].symbol;
				if ( type === 'P' ) {
					jQuery ( '<div class="col-xs-12 enable-hover ex-sugg-wrapp ' + classes [ i % 2 ] + '"><div class="ex-sugg-key col-md-3 col-xs-6">' + k + '</div><div class="ex-sugg-sym col-md-1 hidden-sm hidden-xs">' + symbol + '</div><div class="ex-sugg-value col-md-7 col-xs-6">' + name + '</div><div>' )	.appendTo ( $parent );
				}
				else {
					jQuery ( '<div class="col-xs-12 blue-border ex-sugg-wrapp"><div class="ex-sugg-key col-md-3 col-xs-6">' + k + '</div><div class="ex-sugg-sym col-md-1 hidden-sm hidden-xs">' + symbol + '</div><div class="ex-sugg-value col-md-7 col-xs-6">' + name + '</div><div>' )	.appendTo ( $parent );
				}
			}
		}
		
		if ( type === 'M' ) {
			jQuery ( '<div class="col-xs-12 finish-me">Finish<div>' )	.appendTo ( $parent );
		}
	};
	
	removeCurrencyInput = function () {
		jQuery ( ".ex-prime-further" )	.remove ();
	};
	
	showCurrencyInput = function ( key ) {
		jQuery ( "<div class='ex-prime-further'><input type='number' value='" + baseRate + "' id='ex-prime-input-curr' /><span class='block-me-inline margin-class bold-me'>" + key + " ( " + currJSON [key].name + " ) </span></div>" )	.appendTo ( jQuery ( '#ex-prim-curr-outer' ) );
		handleFinish ();
	};
	
	showFurther = function ( type, key ) {
		if ( type === 'P' ) { removeCurrencyInput (); showCurrencyInput ( key ); }
		else if ( type === 'M' ) {
			multipleCurrencies ( key );
		}
	};
	
	jQuery ( '#ex-prim-curr' )	.on ( 'click', '.ex-sugg-wrapp', function () {
		$this = jQuery ( this );
		var key = jQuery	.trim ($this	.find ( '.ex-sugg-key' )
											.text ());
		var value = jQuery	.trim ($this	.find ( '.ex-sugg-value' )
											.text ());									
		jQuery ( "#ex-prime" )	.val ( key );
		if ( base !== '' ) {
			prevBase = base;
		}
		base = key;
		removeSugg ();
		showFurther ( 'P', key );
	});
	
	
	// Multiple Currencies Area
	
	calculateRate = function ( baseKey, toKey ) {
		console.log ( baseRate );
		return (parseFloat ( baseRate ) * parseFloat ( parseFloat ( rates [toKey] ) / parseFloat ( rates [baseKey] ) )).toFixed( 2 );
	};
	
	multipleCurrencies = function ( key ) {
		if ( multCurr.indexOf ( key ) == -1 ) {
			multCurr.push ( key );
			if ( jQuery ( '.ex-mult-curr-outer-class' )	.length == 0 ) {
				jQuery ( '<div class="row ex-mult-curr-outer-class"></div>' )	.appendTo ( '#ex-mult-curr-outer' );
			}
			
			jQuery ( '<div id="' + key + '" class="col-xs-12 ex-mult-curr-wrapp"><div class="col-xs-8 ex-mult-curr-rate">' + calculateRate ( base, key ) + '</div><div class="col-xs-2 ex-mult-curr-key">' + key + '</div><div class="col-xs-1 ex-mult-remove">x</div></div>' )	.appendTo ( jQuery ( '.ex-mult-curr-outer-class' ) );
			
		}
	};
	
	jQuery ( '#ex-mult-curr' )	.on ( 'click', '.ex-sugg-wrapp', function () {
		$this = jQuery ( this );
		var key = jQuery	.trim ($this	.find ( '.ex-sugg-key' )
											.text ());
		var value = jQuery	.trim ($this	.find ( '.ex-sugg-value' )
											.text ());									
											
		$this	.addClass ( 'select-bg' );
		//jQuery ( "#ex-prime" )	.val ( key );
		//base = key;
		//removeSugg ();
		showFurther ( 'M', key );
	});
	
	jQuery ( ".input-mult-text" )	.keyup ( function () {
		var val = jQuery	.trim ( jQuery ( this ) .val () );
		val = val.toUpperCase();
		if ( val !== '' ) {
			var indices = keys.partialSearch ( val );
			/*for ( var index in indices ) {
				var k = keys [ indices [index] ];
				if ( k !== undefined ) {
					//console.log ( 'Key: ' + k + ' Value: ' + currJSON [ k ] )
				}
			}*/
			currSuggestions ( indices, 'M' );
		}
	});
	
	editMultipleCurrencies = function ( key, callback ) {
		//var id = "#key-" + key;
		console.log ( key + ":Here" );
		if ( jQuery ( '#' + key )	.length > 0 ) {
			jQuery ( '#' + key )	.find ( '.ex-mult-curr-rate' )
							.text ( calculateRate ( base, key ) );
		}
		callback();
	};
	
	loopEntries = function ( multCurr, inLoop ) {
		var len = multCurr.length;
		console.log ( ' Iam here ' + inLoop + ":" + multCurr [inLoop] );
		callBackFunction ( multCurr [inLoop], function () {
			++ inLoop;
			if ( inLoop < len ) loopEntries ( multCurr, inLoop );
		});
	};
	
	callBackFunction = function ( key, callback ) {
		editMultipleCurrencies ( key, function () {
			callback();
		});
	};
	
	handleFinish = function () {
		if ( prevBase !== '' || baseRate !== 1 ) {
			if ( prevBase != base || baseRate !== 1 ) {
				if ( multCurr.length > 0 ) {
					loopEntries ( multCurr, 0 );
				}
			}
		}
		removeSugg ();
	};
	
	jQuery ( '#ex-mult-curr' )	.on ( 'click', '.finish-me', function () {
		handleFinish ();
	});
	
	jQuery ( '#ex-mult-curr-outer' )	.on ( 'click', '.ex-mult-remove', function () {
		var key = jQuery ( this )	.parent ()
									.attr ( 'id' );
									
		jQuery ( this )	.parent ()
						.remove ();				
		
		var position = multCurr.indexOf ( key );
		
		if ( position > -1 ) {
			multCurr.splice ( position, 1 );
		}
				
	});
	
	jQuery ( '#ex-prim-curr-outer' )	.on ( 'change', '#ex-prime-input-curr', function () {
		baseRate = jQuery	.trim ( jQuery ( this )	.val () );
		console.log ( baseRate );
		handleFinish ();
	});
	
});