webpackJsonp([0],{

/***/ 1514:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_react_redux__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_react_redux___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_react_redux__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__actions__ = __webpack_require__(77);




class ArtistEdit extends __WEBPACK_IMPORTED_MODULE_0_react__["Component"] {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentWillMount() {
    this.props.findArtist(this.props.params.id);
  }

  componentWillReceiveProps({ artist }) {
    if (artist) {
      const { name, age, yearsActive, genre } = artist;

      this.setState({ name, age, yearsActive, genre });
    }
  }

  componentWillUpdate(nextProps) {
    if (nextProps.params.id !== this.props.params.id) {
      this.props.findArtist(nextProps.params.id);
    }
  }

  componentWillUnmount() {
    this.props.clearError();
  }

  onSubmit(event) {
    event.preventDefault();
    event.stopPropagation();

    this.props.editArtist(this.props.params.id, this.state);
  }

  render() {
    return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
      'form',
      { onSubmit: this.onSubmit.bind(this) },
      __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        'div',
        { className: 'input-field' },
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement('input', {
          value: this.state.name,
          onChange: e => this.setState({ name: e.target.value }),
          placeholder: 'Name'
        })
      ),
      __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        'div',
        { className: 'input-field' },
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement('input', {
          value: this.state.age,
          onChange: e => this.setState({ age: e.target.value }),
          placeholder: 'Age'
        })
      ),
      __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        'div',
        { className: 'input-field' },
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement('input', {
          value: this.state.yearsActive,
          onChange: e => this.setState({ yearsActive: e.target.value }),
          placeholder: 'Years Active'
        })
      ),
      __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        'div',
        { className: 'input-field' },
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement('input', {
          value: this.state.genre,
          onChange: e => this.setState({ genre: e.target.value }),
          placeholder: 'Genre'
        })
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
    artist: state.artists.artist,
    errorMessage: state.errors
  };
};

/* harmony default export */ __webpack_exports__["default"] = (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_react_redux__["connect"])(mapStateToProps, __WEBPACK_IMPORTED_MODULE_2__actions__)(ArtistEdit));

/***/ })

});