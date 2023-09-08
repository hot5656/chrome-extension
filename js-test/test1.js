// var a = new Promise(function (resolve, reject) {
//   setTimeout(() => {
//     reject("OOPS");
//   }, 2000);
// });

// a.catch(function (value) {
//   console.log(a);
//   console.log(value);
// });

// 1st Promise example
// function init(resolve, reject) {
// 	// resolve(5)	// data= 5, return for then
// 	reject(3) // error= 3, return for catch
// }
// const myPromise = new Promise(init)
// sampe function as up example
// const myPromise = new Promise((resolve, reject) => {
//   resolve(4);
// });

// myPromise
//   .then((data) => {
//     console.log("data=", data);
//   })
//   .catch((err) => {
//     console.log("error=", err);
//   });

const myPromise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(6);
  }, 3000);
});
myPromise
  .then((data) => {
    console.log("data=", data);
  })
  .catch((err) => {
    console.log("error=", err);
  });
