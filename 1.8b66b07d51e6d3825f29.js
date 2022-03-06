webpackJsonp([1],{

/***/ 1513:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_react_redux__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_react_redux___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_react_redux__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_react_router__ = __webpack_require__(52);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__actions__ = __webpack_require__(77);





class ArtistDetail extends __WEBPACK_IMPORTED_MODULE_0_react__["Component"] {
  componentWillMount() {
    this.props.findArtist(this.props.params.id);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.id !== this.props.params.id) {
      this.props.findArtist(nextProps.params.id);
    }
  }

  componentWillUnmount() {
    this.props.resetArtist();
  }

  onDeleteClick() {
    this.props.deleteArtist(this.props.params.id);
  }

  renderAlbums() {
    const { albums } = this.props.artist;

    if (!albums || !albums.map) {
      return;
    }

    return albums.map(album => {
      return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        'div',
        { className: 'card album', key: album.title },
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          'div',
          { className: 'card-image' },
          __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement('img', { src: album.image }),
          __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
            'span',
            { className: 'card-title' },
            __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
              'h4',
              null,
              album.title
            )
          )
        ),
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          'div',
          { className: 'card-content' },
          __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
            'div',
            null,
            __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
              'h5',
              null,
              album.copiesSold
            ),
            __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
              'i',
              null,
              'copies sold'
            )
          ),
          __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
            'div',
            null,
            __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
              'h5',
              null,
              album.numberTracks
            ),
            __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
              'i',
              null,
              'tracks'
            )
          )
        )
      );
    });
  }

  render() {
    if (!this.props.artist) {
      return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        'div',
        null,
        'Todo: implement "FindArtist" query'
      );
    }

    const { artist: { name, age, genre, image, yearsActive, netWorth, labelName, _id } } = this.props;

    return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
      'div',
      null,
      __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        'div',
        { className: 'spacer' },
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          __WEBPACK_IMPORTED_MODULE_2_react_router__["c" /* Link */],
          { to: '/' },
          'Back'
        ),
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          __WEBPACK_IMPORTED_MODULE_2_react_router__["c" /* Link */],
          { to: `/artists/${_id}/edit` },
          'Edit'
        ),
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          'a',
          { onClick: this.onDeleteClick.bind(this) },
          'Delete'
        )
      ),
      __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        'ul',
        { className: 'collection artist-detail' },
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          'li',
          { className: 'collection-item header' },
          __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
            'div',
            null,
            __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
              'h3',
              null,
              name
            ),
            __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
              'h5',
              null,
              'Master of ',
              genre
            )
          ),
          __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement('image', { src: image, className: 'right' })
        ),
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          'li',
          { className: 'collection-item' },
          __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
            'h5',
            null,
            yearsActive
          ),
          __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
            'p',
            null,
            __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
              'i',
              null,
              'Years Active'
            )
          )
        ),
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          'li',
          { className: 'collection-item' },
          __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
            'h5',
            null,
            age
          ),
          __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
            'p',
            null,
            __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
              'i',
              null,
              'Years Old'
            )
          )
        ),
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          'li',
          { className: 'collection-item' },
          __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
            'h5',
            null,
            '$',
            netWorth
          ),
          __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
            'p',
            null,
            __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
              'i',
              null,
              'Net Worth'
            )
          )
        ),
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          'li',
          { className: 'collection-item' },
          __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
            'h5',
            null,
            labelName
          ),
          __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
            'p',
            null,
            __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
              'i',
              null,
              'Label'
            )
          )
        ),
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          'li',
          { className: 'flex wrap' },
          this.renderAlbums()
        )
      )
    );
  }
}

const mapStateToProps = ({ artists }) => {
  return { artist: artists.artist };
};

/* harmony default export */ __webpack_exports__["default"] = (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_react_redux__["connect"])(mapStateToProps, __WEBPACK_IMPORTED_MODULE_3__actions__)(ArtistDetail));

/***/ })

});