goog.provide('ol.TilePriorityFunction');
goog.provide('ol.TileQueue');

goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('ol.Coordinate');
goog.require('ol.Tile');
goog.require('ol.structs.PriorityQueue');


/**
 * @typedef {function(ol.Tile, string, ol.Coordinate, number): number}
 */
ol.TilePriorityFunction;



/**
 * @constructor
 * @extends {ol.structs.PriorityQueue}
 * @param {ol.TilePriorityFunction} tilePriorityFunction
 *     Tile priority function.
 * @param {Function} tileChangeCallback
 *     Function called on each tile change event.
 */
ol.TileQueue = function(tilePriorityFunction, tileChangeCallback) {

  goog.base(
      this,
      /**
       * @param {Array} element Element.
       * @return {number} Priority.
       */
      function(element) {
        return tilePriorityFunction.apply(null, element);
      },
      /**
       * @param {Array} element Element.
       * @return {string} Key.
       */
      function(element) {
        return /** @type {ol.Tile} */ (element[0]).getKey();
      });

  /**
   * @private
   * @type {Function}
   */
  this.tileChangeCallback_ = tileChangeCallback;

  /**
   * @private
   * @type {number}
   */
  this.tilesLoading_ = 0;

};
goog.inherits(ol.TileQueue, ol.structs.PriorityQueue);


/**
 * @protected
 */
ol.TileQueue.prototype.handleTileChange = function() {
  --this.tilesLoading_;
  this.tileChangeCallback_();
};


/**
 * @param {number} limit Maximum number of new tiles to load.
 * @param {number} maxTilesLoading Maximum number tiles to load simultaneously.
 */
ol.TileQueue.prototype.loadMoreTiles = function(limit, maxTilesLoading) {
  var tile;
  while (limit > 0 &&
         !this.isEmpty() &&
         this.tilesLoading_ < maxTilesLoading) {
    tile = /** @type {ol.Tile} */ (this.dequeue()[0]);
    goog.events.listenOnce(tile, goog.events.EventType.CHANGE,
        this.handleTileChange, false, this);
    tile.load();
    ++this.tilesLoading_;
    --limit;
  }
};
