webpackJsonp([2],{

/***/ 1512:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_react_redux__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_react_redux___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_react_redux__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_redux_form__ = __webpack_require__(72);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__actions__ = __webpack_require__(77);





class ArtistCreate extends __WEBPACK_IMPORTED_MODULE_0_react__["Component"] {
  componentWillUnmount() {
    this.props.clearError();
  }

  onSubmit(formProps) {
    this.props.createArtist(formProps);
  }

  render() {
    const { handleSubmit } = this.props;

    return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
      'form',
      { onSubmit: handleSubmit(this.onSubmit.bind(this)) },
      __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        'div',
        { className: 'input-field' },
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(__WEBPACK_IMPORTED_MODULE_2_redux_form__["Field"], { name: 'name', component: 'input', placeholder: 'Name' })
      ),
      __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        'div',
        { className: 'input-field' },
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(__WEBPACK_IMPORTED_MODULE_2_redux_form__["Field"], { name: 'age', component: 'input', placeholder: 'Age' })
      ),
      __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        'div',
        { className: 'input-field' },
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(__WEBPACK_IMPORTED_MODULE_2_redux_form__["Field"], { name: 'yearsActive', component: 'input', placeholder: 'Years Active' })
      ),
      __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        'div',
        { className: 'input-field' },
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(__WEBPACK_IMPORTED_MODULE_2_redux_form__["Field"], { name: 'genre', component: 'input', placeholder: 'Genre' })
      ),
      __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        'div',
        { className: 'has-error' },
        this.props.errorMessage
      ),
      __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        'button',
        { className: 'btn' },
        'Submit'
      )
    );
  }
}

const mapStateToProps = state => {
  return {
    errorMessage: state.errors
  };
};

/* harmony default export */ __webpack_exports__["default"] = (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_react_redux__["connect"])(mapStateToProps, __WEBPACK_IMPORTED_MODULE_3__actions__)(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2_redux_form__["reduxForm"])({
  form: 'create'
})(ArtistCreate)));

/***/ })

});