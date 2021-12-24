$.noConflict();
(function( jQuery ) {
	jQuery.Shop = function( element ) {
		this.jQueryelement = jQuery ( element );
		this.init();
	};
	
	jQuery.Shop.prototype = {
		init: function() {
		
		    // Properties
		
			this.cartPrefix = "Furniture-"; // Prefix string to be prepended to the cart's name in the session storage
			this.cartName = this.cartPrefix + "cart"; // Cart name in the session storage
			this.shippingRates = this.cartPrefix + "shipping-rates"; // Shipping rates key in the session storage
			this.total = this.cartPrefix + "total"; // Total key in the session storage
			this.storage = sessionStorage; // shortcut to the sessionStorage object
			
			
			this.jQueryformAddToCart = this.jQueryelement.find( "form.add-to-cart" ); // Forms for adding items to the cart
			this.jQueryformCart = this.jQueryelement.find( "#shopping-cart" ); // Shopping cart form
			this.jQuerycheckoutCart = this.jQueryelement.find( "#checkout-cart" ); // Checkout form cart
			this.jQuerycheckoutOrderForm = this.jQueryelement.find( "#checkout-order-form" ); // Checkout user details form
			this.jQueryshipping = this.jQueryelement.find( "#sshipping" ); // Element that displays the shipping rates
			this.jQuerysubTotal = this.jQueryelement.find( "#stotal" ); // Element that displays the subtotal charges
			this.jQueryshoppingCartActions = this.jQueryelement.find( "#shopping-cart-actions" ); // Cart actions links
			this.jQueryupdateCartBtn = this.jQueryshoppingCartActions.find( "#update-cart" ); // Update cart button
			this.jQueryemptyCartBtn = this.jQueryshoppingCartActions.find( "#empty-cart" ); // Empty cart button
			this.jQueryuserDetails = this.jQueryelement.find( "#user-details-content" ); // Element that displays the user information
			this.jQuerypaypalForm = this.jQueryelement.find( "#paypal-form" ); // PayPal form
			
			
			this.currency = "&#8377;"; // HTML entity of the currency to be displayed in the layout
			this.currencyString = "₹"; // Currency symbol as textual string
			this.paypalCurrency = "EUR"; // PayPal's currency code
			this.paypalBusinessEmail = "yourbusiness@email.com"; // Your Business PayPal's account email address
			this.paypalURL = "https://www.sandbox.paypal.com/cgi-bin/webscr"; // The URL of the PayPal's form
			
			// Object containing patterns for form validation
			this.requiredFields = {
				expression: {
					value: /^([\w-\.]+)@((?:[\w]+\.)+)([a-z]){2,4}jQuery/
				},
				
				str: {
					value: ""
				}
				
			};
			
			// Method invocation
			
			this.createCart();
			this.handleAddToCartForm();
			this.handleCheckoutOrderForm();
			this.emptyCart();
			this.updateCart();
			this.displayCart();
			this.deleteProduct();
			this.displayUserDetails();
			this.populatePayPalForm();
			
			
		},
		
		// Public methods
		
		// Creates the cart keys in the session storage
		
		createCart: function() {
			if( this.storage.getItem( this.cartName ) == null ) {
			
				var cart = {};
				cart.items = [];
			
				this.storage.setItem( this.cartName, this._toJSONString( cart ) );
				this.storage.setItem( this.shippingRates, "0" );
				this.storage.setItem( this.total, "0" );
			}
		},
		
		// Appends the required hidden values to the PayPal's form before submitting
		
		populatePayPalForm: function() {
			var self = this;
			if( self.jQuerypaypalForm.length ) {
				var jQueryform = self.jQuerypaypalForm;
				var cart = self._toJSONObject( self.storage.getItem( self.cartName ) );
				var shipping = self.storage.getItem( self.shippingRates );
				var numShipping = self._convertString( shipping );
				var cartItems = cart.items; 
				var singShipping = Math.floor( numShipping / cartItems.length );
				
				jQueryform.attr( "action", self.paypalURL );
				jQueryform.find( "input[name='business']" ).val( self.paypalBusinessEmail );
				jQueryform.find( "input[name='currency_code']" ).val( self.paypalCurrency );
				
				for( var i = 0; i < cartItems.length; ++i ) {
					var cartItem = cartItems[i];
					var n = i + 1;
					var name = cartItem.product;
					var price = cartItem.price;
					var qty = cartItem.qty;
					
					jQuery( "<div/>" ).html( "<input type='hidden' name='quantity_" + n + "' value='" + qty + "'/>" ).
					insertBefore( "#paypal-btn" );
					jQuery( "<div/>" ).html( "<input type='hidden' name='item_name_" + n + "' value='" + name + "'/>" ).
					insertBefore( "#paypal-btn" );
					jQuery( "<div/>" ).html( "<input type='hidden' name='item_number_" + n + "' value='SKU " + name + "'/>" ).
					insertBefore( "#paypal-btn" );
					jQuery( "<div/>" ).html( "<input type='hidden' name='amount_" + n + "' value='" + self._formatNumber( price, 2 ) + "'/>" ).
					insertBefore( "#paypal-btn" );
					jQuery( "<div/>" ).html( "<input type='hidden' name='shipping_" + n + "' value='" + self._formatNumber( singShipping, 2 ) + "'/>" ).
					insertBefore( "#paypal-btn" );
					
				}
				
				
				
			}
		},
		
		// Displays the user's information
		
		displayUserDetails: function() {
			if( this.jQueryuserDetails.length ) {
				if( this.storage.getItem( "shipping-name" ) == null ) {
					var name = this.storage.getItem( "billing-name" );
					var email = this.storage.getItem( "billing-email" );
					var city = this.storage.getItem( "billing-city" );
					var address = this.storage.getItem( "billing-address" );
					var zip = this.storage.getItem( "billing-zip" );
					var country = this.storage.getItem( "billing-country" );
					
					var html = "<div class='detail'>";
						html += "<h2>Billing and Shipping</h2>";
						html += "<ul>";
						html += "<li>" + name + "</li>";
						html += "<li>" + email + "</li>";
						html += "<li>" + city + "</li>";
						html += "<li>" + address + "</li>";
						html += "<li>" + zip + "</li>";
						html += "<li>" + country + "</li>";
						html += "</ul></div>";
						
					this.jQueryuserDetails[0].innerHTML = html;
				} else {
					var name = this.storage.getItem( "billing-name" );
					var email = this.storage.getItem( "billing-email" );
					var city = this.storage.getItem( "billing-city" );
					var address = this.storage.getItem( "billing-address" );
					var zip = this.storage.getItem( "billing-zip" );
					var country = this.storage.getItem( "billing-country" );
					
					var sName = this.storage.getItem( "shipping-name" );
					var sEmail = this.storage.getItem( "shipping-email" );
					var sCity = this.storage.getItem( "shipping-city" );
					var sAddress = this.storage.getItem( "shipping-address" );
					var sZip = this.storage.getItem( "shipping-zip" );
					var sCountry = this.storage.getItem( "shipping-country" );
					
					var html = "<div class='detail'>";
						html += "<h2>Billing</h2>";
						html += "<ul>";
						html += "<li>" + name + "</li>";
						html += "<li>" + email + "</li>";
						html += "<li>" + city + "</li>";
						html += "<li>" + address + "</li>";
						html += "<li>" + zip + "</li>";
						html += "<li>" + country + "</li>";
						html += "</ul></div>";
						
						html += "<div class='detail right'>";
						html += "<h2>Shipping</h2>";
						html += "<ul>";
						html += "<li>" + sName + "</li>";
						html += "<li>" + sEmail + "</li>";
						html += "<li>" + sCity + "</li>";
						html += "<li>" + sAddress + "</li>";
						html += "<li>" + sZip + "</li>";
						html += "<li>" + sCountry + "</li>";
						html += "</ul></div>";
						
					this.jQueryuserDetails[0].innerHTML = html;	
				
				}
			}
		},

		// Delete a product from the shopping cart

		deleteProduct: function() {
			var self = this;
			if( self.jQueryformCart.length ) {
				var cart = this._toJSONObject( this.storage.getItem( this.cartName ) );
				var items = cart.items;

				jQuery( document ).on( "click", ".pdelete a", function( e ) {
					e.preventDefault();
					var productName = jQuery( this ).data( "product" );
					var newItems = [];
					for( var i = 0; i < items.length; ++i ) {
						var item = items[i];
						var product = item.product;	
						if( product == productName ) {
							items.splice( i, 1 );
						}
					}
					newItems = items;
					var updatedCart = {};
					updatedCart.items = newItems;

					var updatedTotal = 0;
					var totalQty = 0;
					if( newItems.length == 0 ) {
						updatedTotal = 0;
						totalQty = 0;
					} else {
						for( var j = 0; j < newItems.length; ++j ) {
							var prod = newItems[j];
							var sub = prod.price * prod.qty;
							updatedTotal += sub;
							totalQty += prod.qty;
						}
					}

					self.storage.setItem( self.total, self._convertNumber( updatedTotal ) );
					self.storage.setItem( self.shippingRates, self._convertNumber( self._calculateShipping( totalQty ) ) );

					self.storage.setItem( self.cartName, self._toJSONString( updatedCart ) );
					jQuery( this ).parents( "tr" ).remove();
					self.jQuerysubTotal[0].innerHTML = self.currency + " " + self.storage.getItem( self.total );
				});
			}
		},
		
		// Displays the shopping cart
		
		displayCart: function() {
			if( this.jQueryformCart.length ) {
				var cart = this._toJSONObject( this.storage.getItem( this.cartName ) );
				var items = cart.items;
				var jQuerytableCart = this.jQueryformCart.find( ".shopping-cart" );
				var jQuerytableCartBody = jQuerytableCart.find( "tbody" );

				if( items.length == 0 ) {
					jQuerytableCartBody.html( "" );	
				} else {
				
				
					for( var i = 0; i < items.length; ++i ) {
						var item = items[i];
						var product = item.product;
						var price = this.currency + " " + item.price;
						var qty = item.qty;
						var html = "<tr><td class='pname'>" + product + "</td>" + "<td class='pqty'><input type='text' value='" + qty + "' class='qty'/></td>";
					    	html += "<td class='pprice'>" + price + "</td><td class='pdelete'><a href='' data-product='" + product + "'>&times;</a></td></tr>";
					
							jQuerytableCartBody.html( jQuerytableCartBody.html() + html );
					}

				}

				if( items.length == 0 ) {
					this.jQuerysubTotal[0].innerHTML = this.currency + " " + 0.00;
				} else {	
				
					var total = this.storage.getItem( this.total );
					this.jQuerysubTotal[0].innerHTML = this.currency + " " + total;
				}
			} else if( this.jQuerycheckoutCart.length ) {
				var checkoutCart = this._toJSONObject( this.storage.getItem( this.cartName ) );
				var cartItems = checkoutCart.items;
				var jQuerycartBody = this.jQuerycheckoutCart.find( "tbody" );

				if( cartItems.length > 0 ) {
				
					for( var j = 0; j < cartItems.length; ++j ) {
						var cartItem = cartItems[j];
						var cartProduct = cartItem.product;
						var cartPrice = this.currency + " " + cartItem.price;
						var cartQty = cartItem.qty;
						var cartHTML = "<tr><td class='pname'>" + cartProduct + "</td>" + "<td class='pqty'>" + cartQty + "</td>" + "<td class='pprice'>" + cartPrice + "</td></tr>";
					
						jQuerycartBody.html( jQuerycartBody.html() + cartHTML );
					}
				} else {
					jQuerycartBody.html( "" );	
				}

				if( cartItems.length > 0 ) {
				
					var cartTotal = this.storage.getItem( this.total );
					var cartShipping = this.storage.getItem( this.shippingRates );
					var subTot = this._convertString( cartTotal ) + this._convertString( cartShipping );
				
					this.jQuerysubTotal[0].innerHTML = this.currency + " " + this._convertNumber( subTot );
					this.jQueryshipping[0].innerHTML = this.currency + " " + cartShipping;
				} else {
					this.jQuerysubTotal[0].innerHTML = this.currency + " " + 0.00;
					this.jQueryshipping[0].innerHTML = this.currency + " " + 0.00;	
				}
			
			}
		},
		
		// Empties the cart by calling the _emptyCart() method
		// @see jQuery.Shop._emptyCart()
		
		emptyCart: function() {
			var self = this;
			if( self.jQueryemptyCartBtn.length ) {
				self.jQueryemptyCartBtn.on( "click", function() {
					self._emptyCart();
				});
			}
		},
		
		// Updates the cart
		
		updateCart: function() {
			var self = this;
		  if( self.jQueryupdateCartBtn.length ) {
			self.jQueryupdateCartBtn.on( "click", function() {
				var jQueryrows = self.jQueryformCart.find( "tbody tr" );
				var cart = self.storage.getItem( self.cartName );
				var shippingRates = self.storage.getItem( self.shippingRates );
				var total = self.storage.getItem( self.total );
				
				var updatedTotal = 0;
				var totalQty = 0;
				var updatedCart = {};
				updatedCart.items = [];
				
				jQueryrows.each(function() {
					var jQueryrow = jQuery( this );
					var pname = jQuery.trim( jQueryrow.find( ".pname" ).text() );
					var pqty = self._convertString( jQueryrow.find( ".pqty > .qty" ).val() );
					var pprice = self._convertString( self._extractPrice( jQueryrow.find( ".pprice" ) ) );
					
					var cartObj = {
						product: pname,
						price: pprice,
						qty: pqty
					};
					
					updatedCart.items.push( cartObj );
					
					var subTotal = pqty * pprice;
					updatedTotal += subTotal;
					totalQty += pqty;
				});
				
				self.storage.setItem( self.total, self._convertNumber( updatedTotal ) );
				self.storage.setItem( self.shippingRates, self._convertNumber( self._calculateShipping( totalQty ) ) );
				self.storage.setItem( self.cartName, self._toJSONString( updatedCart ) );
				
			});
		  }
		},
		
		// Adds items to the shopping cart
		
		handleAddToCartForm: function() {
			var self = this;
			self.jQueryformAddToCart.each(function() {
				var jQueryform = jQuery( this );
				var jQueryproduct = jQueryform.parent();
				var price = self._convertString( jQueryproduct.data( "price" ) );
				var name =  jQueryproduct.data( "name" );
				
				jQueryform.on( "submit", function() {
					var qty = self._convertString( jQueryform.find( ".qty" ).val() );
					var subTotal = qty * price;
					var total = self._convertString( self.storage.getItem( self.total ) );
					var sTotal = total + subTotal;
					self.storage.setItem( self.total, sTotal );
					self._addToCart({
						product: name,
						price: price,
						qty: qty
					});
					var shipping = self._convertString( self.storage.getItem( self.shippingRates ) );
					var shippingRates = self._calculateShipping( qty );
					var totalShipping = shipping + shippingRates;
					
					self.storage.setItem( self.shippingRates, totalShipping );
				});
			});
		},
		
		// Handles the checkout form by adding a validation routine and saving user's info into the session storage
		
		handleCheckoutOrderForm: function() {
			var self = this;
			if( self.jQuerycheckoutOrderForm.length ) {
				var jQuerysameAsBilling = jQuery( "#same-as-billing" );
				jQuerysameAsBilling.on( "change", function() {
					var jQuerycheck = jQuery( this );
					if( jQuerycheck.prop( "checked" ) ) {
						jQuery( "#fieldset-shipping" ).slideUp( "normal" );
					} else {
						jQuery( "#fieldset-shipping" ).slideDown( "normal" );
					}
				});
				
				self.jQuerycheckoutOrderForm.on( "submit", function() {
					var jQueryform = jQuery( this );
					var valid = self._validateForm( jQueryform );
					
					if( !valid ) {
						return valid;
					} else {
						self._saveFormData( jQueryform );
					}
				});
			}
		},
		
		// Private methods
		
		
		// Empties the session storage
		
		_emptyCart: function() {
			this.storage.clear();
		},
		
		/* Format a number by decimal places
		 * @param num Number the number to be formatted
		 * @param places Number the decimal places
		 * @returns n Number the formatted number
		 */
		 
		 
		
		_formatNumber: function( num, places ) {
			var n = num.toFixed( places );
			return n;
		},
		
		/* Extract the numeric portion from a string
		 * @param element Object the jQuery element that contains the relevant string
		 * @returns price String the numeric string
		 */
		
		
		_extractPrice: function( element ) {
			var self = this;
			var text = element.text();
			var price = text.replace( self.currencyString, "" ).replace( " ", "" );
			return price;
		},
		
		/* Converts a numeric string into a number
		 * @param numStr String the numeric string to be converted
		 * @returns num Number the number
		 */
		
		_convertString: function( numStr ) {
			var num;
			if( /^[-+]?[0-9]+\.[0-9]+jQuery/.test( numStr ) ) {
				num = parseFloat( numStr );
			} else if( /^\d+jQuery/.test( numStr ) ) {
				num = parseInt( numStr, 10 );
			} else {
				num = Number( numStr );
			}
			
			if( !isNaN( num ) ) {
				return num;
			} else {
				console.warn( numStr + " cannot be converted into a number" );
				return false;
			}
		},
		
		/* Converts a number to a string
		 * @param n Number the number to be converted
		 * @returns str String the string returned
		 */
		
		_convertNumber: function( n ) {
			var str = n.toString();
			return str;
		},
		
		/* Converts a JSON string to a JavaScript object
		 * @param str String the JSON string
		 * @returns obj Object the JavaScript object
		 */
		
		_toJSONObject: function( str ) {
			var obj = JSON.parse( str );
			return obj;
		},
		
		/* Converts a JavaScript object to a JSON string
		 * @param obj Object the JavaScript object
		 * @returns str String the JSON string
		 */
		
		
		_toJSONString: function( obj ) {
			var str = JSON.stringify( obj );
			return str;
		},
		
		
		/* Add an object to the cart as a JSON string
		 * @param values Object the object to be added to the cart
		 * @returns void
		 */
		
		
		_addToCart: function( values ) {
			var cart = this.storage.getItem( this.cartName );
			
			var cartObject = this._toJSONObject( cart );
			var cartCopy = cartObject;
			var items = cartCopy.items;
			items.push( values );
			
			this.storage.setItem( this.cartName, this._toJSONString( cartCopy ) );
		},
		
		/* Custom shipping rates calculation based on the total quantity of items in the cart
		 * @param qty Number the total quantity of items
		 * @returns shipping Number the shipping rates
		 */
		
		_calculateShipping: function( qty ) {
			var shipping = 0;
			if( qty >= 6 ) {
				shipping = 10;
			}
			if( qty >= 12 && qty <= 30 ) {
				shipping = 20;	
			}
			
			if( qty >= 30 && qty <= 60 ) {
				shipping = 30;	
			}
			
			if( qty > 60 ) {
				shipping = 0;
			}
			
			return shipping;
		
		},
		
		/* Validates the checkout form
		 * @param form Object the jQuery element of the checkout form
		 * @returns valid Boolean true for success, false for failure
		 */
		 
		 
		
		_validateForm: function( form ) {
			var self = this;
			var fields = self.requiredFields;
			var jQueryvisibleSet = form.find( "fieldset:visible" );
			var valid = true;
			
			form.find( ".message" ).remove();
			
		  jQueryvisibleSet.each(function() {
			
			jQuery( this ).find( ":input" ).each(function() {
				var jQueryinput = jQuery( this );
				var type = jQueryinput.data( "type" );
				var msg = jQueryinput.data( "message" );
				
				if( type == "string" ) {
					if( jQueryinput.val() == fields.str.value ) {
						jQuery( "<span class='message'/>" ).text( msg ).
						insertBefore( jQueryinput );
						
						valid = false;
					}
				} else {
					if( !fields.expression.value.test( jQueryinput.val() ) ) {
						jQuery( "<span class='message'/>" ).text( msg ).
						insertBefore( jQueryinput );
						
						valid = false;
					}
				}
				
			});
		  });
			
			return valid;
		
		},
		
		/* Save the data entered by the user in the ckeckout form
		 * @param form Object the jQuery element of the checkout form
		 * @returns void
		 */
		
		
		_saveFormData: function( form ) {
			var self = this;
			var jQueryvisibleSet = form.find( "fieldset:visible" );
			
			jQueryvisibleSet.each(function() {
				var jQueryset = jQuery( this );
				if( jQueryset.is( "#fieldset-billing" ) ) {
					var name = jQuery( "#name", jQueryset ).val();
					var email = jQuery( "#email", jQueryset ).val();
					var city = jQuery( "#city", jQueryset ).val();
					var address = jQuery( "#address", jQueryset ).val();
					var zip = jQuery( "#zip", jQueryset ).val();
					var country = jQuery( "#country", jQueryset ).val();
					
					self.storage.setItem( "billing-name", name );
					self.storage.setItem( "billing-email", email );
					self.storage.setItem( "billing-city", city );
					self.storage.setItem( "billing-address", address );
					self.storage.setItem( "billing-zip", zip );
					self.storage.setItem( "billing-country", country );
				} else {
					var sName = jQuery( "#sname", jQueryset ).val();
					var sEmail = jQuery( "#semail", jQueryset ).val();
					var sCity = jQuery( "#scity", jQueryset ).val();
					var sAddress = jQuery( "#saddress", jQueryset ).val();
					var sZip = jQuery( "#szip", jQueryset ).val();
					var sCountry = jQuery( "#scountry", jQueryset ).val();
					
					self.storage.setItem( "shipping-name", sName );
					self.storage.setItem( "shipping-email", sEmail );
					self.storage.setItem( "shipping-city", sCity );
					self.storage.setItem( "shipping-address", sAddress );
					self.storage.setItem( "shipping-zip", sZip );
					self.storage.setItem( "shipping-country", sCountry );
				
				}
			});
		}
	};
	
	jQuery(function() {
		var shop = new jQuery.Shop( "#site" );
	});

})( jQuery );


