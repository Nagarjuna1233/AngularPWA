'use strict';
var app = angular.module("quickapp", ["ngRoute","ngStorage",'toaster']);
var siteURL='http://192.168.1.40:8887';
var restWebSiteName='https://localhost:9002/';
var restWebURL=restWebSiteName+'techoutscommercewebservices';
var restNonAutoURL=restWebURL+'/v2/electronics';
//add username=<>&password=<>
var tokenURL=restWebURL+'/oauth/token?client_id=mobile_android&client_secret=secret&grant_type=password';
var refresh_TokentURL=restWebURL+'/oauth/token?refresh_token=44009fe5-28d2-45d8-9c73-2afa8ffa7749&client_id=mobile_android&client_secret=secret&grant_type=refresh_token&redirect_uri='+siteURL;
var catalogURL=restNonAutoURL+'/catalogs';
var productsSearchBaseURL=restNonAutoURL+'/products/search?';
var productSearchBaseURL=restNonAutoURL+'/products/';
var username='nag@gmail.com';
var password='123456';
//add access_tocken to query param 
var user_loginURL=restNonAutoURL+'/users/'+username+'/loginMobile';
var access_token='';
var cartCreateBaseURL=restNonAutoURL+'/users/'+username+'/carts'
var cartID='';
var config = {
          headers:  {
          "Accept" : "application/json"
      }
  }
      console.log("catalog url :"+catalogURL);
      app.controller('mainCtrl', function ($scope, $http){
        $http.get(catalogURL,config).success(function(basecategories) {
          console.log("catalog :"+basecategories);
          $scope.categories =basecategories.catalogs[0].catalogVersions[1].categories;
        });
        
      });
app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl: "home/home_container.html"
    })
    .when("/register", {
        templateUrl : "logging-pages/user-register.html"
    })
    .when("/about", {
        templateUrl : "static-pages/about-us.html"
    })
    .when("/contact", {
        templateUrl : "static-pages/contact.html"
    })
    .when("/login", {
        templateUrl : "logging-pages/user-login.html"
    })
    .when("/products", {
        templateUrl : "home/products_container.html",
    })
    .when("/product", {
        templateUrl : "home/product_container.html",
    }).when("/viewcart", {
        templateUrl : "home/shopping-cart.html",
    });
});


app.controller('loginformCtrl', function($scope,$http) {
    console.log('user login page loading');
    $scope.submit = function() {
        console.log('submitted,id :'+$scope.id+'password:'+$scope.password);
        $http.post(tokenURL+'&username='+username+'&password='+password,config).success(function(data) {
          console.log("user token :"+data.access_token);
          access_token=data.access_token;
        });
        $http.post(user_loginURL+'?newCustomer=N&password='+$scope.password+'&access_token='+access_token,config).success(function(data) {
        console.log("user status:"+data.status);
        if('Success'===data.status){
        console.log("user id :"+data.customerId);
        $scope.id='';
        $scope.password='';
      }else{
        alert('loading failed');
      }
        
    });
}
   
});

app.controller('regformCtrl', function($scope) {
    console.log('user register page loading');
    $scope.submit = function() {
        console.log('register submitted,id :'+$scope.id+'password:'+$scope.password);
        $scope.id='';
        $scope.password='';
    };  
});

app.controller('productsController', function($scope,$http,$routeParams) {
     var productsURL=productsSearchBaseURL+'category='+$routeParams.brandId;
     console.log('========Each brand Url===========:'+productsURL);
     $http.get(productsURL,config).success(function(productsData) {
      $scope.products=[];
      angular.forEach(productsData.products, function(product) {
       var p_img_URL=productSearchBaseURL+product.code+'?fields=DEFAULT,images(FULL)';
       console.log('========Each product Url===========:'+p_img_URL);
        $http.get(p_img_URL,config).success(function(imageData) {
        angular.forEach(imageData.images,function(pImage){
          if(pImage.format=='product'){
           console.log('========Each product Img format===========:'+pImage.format); 
           product.imgURL =restWebSiteName+pImage.url;
           console.log('========Each product Img Url===========:'+product.imgURL);
          }
           });
        });
         this.push(product);
       },$scope.products);

        });
});

app.controller('productController', function($scope,$http,$routeParams,$localStorage,toaster) {
    var productURL=productSearchBaseURL+$routeParams.productID;
    console.log('========Each product Url===========:'+productURL);
     $http.get(productURL,config).success(function(productData) {
       var p_img_URL=productSearchBaseURL+productData.code+'?fields=DEFAULT,images(FULL)';
       console.log('========Each product Url===========:'+p_img_URL);
        $http.get(p_img_URL,config).success(function(imageData) {
        angular.forEach(imageData.images,function(pImage){
          if(pImage.format=='product'){
           console.log('========Each product Img format===========:'+pImage.format); 
           productData.imgURL=restWebSiteName+pImage.url;
           console.log('========Each product Img Url===========:'+productData.imgURL);
          }
           });
        });
         $scope.product=productData;
     });

      $scope.addToCart=function(productCode){

        toaster.pop('success', "QuickFashions", "Item added to cart");
        // toaster.pop('error', "title", "text");
        // toaster.pop('warning', "title", "text");
        // toaster.pop('note', "title", "text");
  
       if(angular.isDefined($localStorage.access_token))
     {
        if(angular.isDefined($localStorage.cartID))
        {
          var addToCartUrl=cartCreateBaseURL+'/'+$localStorage.cartID+'/entries?code='+productCode+'&qty='+$scope.productQty+'&access_token='+$localStorage.access_token;
          console.log("add product to cart url 1"+addToCartUrl);
          $http({
                method: 'POST',
                url: addToCartUrl,
                headers:  {
          "Accept" : "application/json"
                   }
            }).then(function successCallback(eData) {
           console.log("add product to cart1 = " + JSON.stringify(eData));
           });
       }
       else
       {
          var cartCurl=cartCreateBaseURL+'?access_token='+$localStorage.access_token;
          //create cart
          $http.post(cartCurl,config).success(function(cartData) 
          {
          console.log("cart creation:"+cartData.code);
          $localStorage.cartID=cartData.code;
          var addToCartUrl=cartCreateBaseURL+'/'+$localStorage.cartID+'/entries?code='+productCode+'&qty='+$scope.productQty+'&access_token='+$localStorage.access_token;
          console.log("add product to cart url2 "+addToCartUrl);
          //add product to cart
         $http({
                method: 'POST',
                url: addToCartUrl,
                headers:  {
          "Accept" : "application/json"
                   }
            }).then(function successCallback(eData) {
           console.log("add product to cart1 = " + JSON.stringify(eData));
           });
          });

       } 
     }
     else{

      $http.post(tokenURL+'&username='+username+'&password='+password,config).success(function(data) {
          console.log("user token :"+data.access_token);
          $localStorage.access_token=data.access_token;

         if(angular.isDefined($localStorage.cartID))
        {
          var addToCartUrl=cartCreateBaseURL+'/'+$localStorage.cartID+'/entries?code='+productCode+'&qty='+$scope.productQty+'&access_token='+$localStorage.access_token;
          console.log("add product to cart url2 "+addToCartUrl);
          //add product to cart
          $http({
                method: 'POST',
                url: addToCartUrl,
                headers:  {
          "Accept" : "application/json"
                   }
            }).then(function successCallback(eData) {
           console.log("add product to cart1 = " + JSON.stringify(eData));
           });

       }
       else
       {
          var cartCurl=cartCreateBaseURL+'?access_token='+$localStorage.access_token;
          //create cart
          $http.post(cartCurl,config).success(function(cartData) 
          {
          console.log("cart creation:"+cartData.code);
          $localStorage.cartID=cartData.code;
           var addToCartUrl=cartCreateBaseURL+'/'+$localStorage.cartID+'/entries?code='+productCode+'&qty='+$scope.productQty+'&access_token='+$localStorage.access_token;
          console.log("add product to cart url2 "+addToCartUrl);
           //add product to cart
          $http({
                method: 'POST',
                url: addToCartUrl,
                headers:  {
          "Accept" : "application/json"
                   }
            }).then(function successCallback(eData) {
           console.log("add product to cart1 = " + JSON.stringify(eData));
           });
          });

       }

        });
     }
     }

});
app.service('CartPageService', function(){
   this.cartValue ={"totalQty":0,"totalPrice":0,"products":[]};
});
var thumbnail='thumbnail';
app.controller('cartController', function($scope,$http,$localStorage,toaster) {
var entries=[];
 $scope.totalprice=0;
 $scope.removeRow = function(code,entryNumber){       
    var index = -1;   
    var comArr = eval( $scope.orderEntries );
    for( var i = 0; i < comArr.length; i++ ) {
      if( comArr[i].entryNumber === entryNumber ) {
        index = i;
        break;
      }
    }
    if( index === -1 ) {
      alert( "Something gone wrong" );
    }
    $scope.orderEntries.splice( index, 1 );
   var deleteEntrieUrl=cartCreateBaseURL+'/'+$localStorage.cartID+'/entries/'+entryNumber+'?access_token='+$localStorage.access_token;
   $http.delete(deleteEntrieUrl,config).success(function(deleteData){
    toaster.pop('note', "QuickFashions", "Removed the item from cart");
    console.log("Deleted "+entryNumber);
    $scope.totalprice=0;
     angular.forEach($scope.orderEntries,function(entry){
      $scope.totalprice=$scope.totalprice+entry.totalPrice.value;
     });
   });

  };
  if(angular.isDefined($localStorage.access_token))
     {
      if(angular.isDefined($localStorage.cartID))
      {
     var cartViewURL=cartCreateBaseURL+'/'+$localStorage.cartID+'/entries?access_token='+$localStorage.access_token;
     console.log("cart view url "+cartViewURL);
      $http.get(cartViewURL,config).success(function(cartViewData) 
          {
        console.log("cartViewData.orderEntries" + JSON.stringify(cartViewData.orderEntries));
        angular.forEach(cartViewData.orderEntries,function(entry){
        $scope.totalprice=$scope.totalprice+entry.totalPrice.value;
        var p_img_URL=productSearchBaseURL+entry.product.code+'?fields=DEFAULT,images(FULL)';
        console.log('========Each product Url===========:'+p_img_URL);
        $http.get(p_img_URL,config).success(function(imageData) {
        entry.imgURL =restWebSiteName+imageData.images[2].url;
        entries.push(entry);
          // console.log("cart = " + JSON.stringify(entries));
          /*angular.forEach(imageData.images,function(pImage){
          console.log("pImage.format "+pImage.format);
          if(thumbnail===pImage.format){
           console.log('========Each product Img format===========:'+pImage.format); 
           entry.imgURL =restWebSiteName+pImage.url;
           entries.push(entry);
           console.log("cart = " + JSON.stringify(entries));
          }
           });*/
        });

       });
          $scope.orderEntries=entries;
          
          });
      }
      else
      {
        console.log("cart not exist");
      }
     }else{
       $http.post(tokenURL+'&username='+username+'&password='+password,config).success(function(data) {
          console.log("user token :"+data.access_token);
          $localStorage.access_token=data.access_token;
          if(angular.isDefined($localStorage.cartID))
      {
     var cartViewURL=cartCreateBaseURL+'/'+$localStorage.cartID+'/entries?access_token='+$localStorage.access_token;
           console.log("cart view url "+cartViewURL);
      $http.get(cartViewURL,config).success(function(cartViewData) 
          {
          console.log("cart = " + JSON.stringify(cartViewData));
          $scope.orderEntries=cartViewData.orderEntries;
          });
      }
      else
      {
        console.log("cart not exist");
      }
                    });
     }
});




