import React, { useState, useEffect, createContext, useContext } from 'react';
import { Search, Heart, BookmarkPlus, X, Filter, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

// Collection Context
const CollectionContext = createContext();

const CollectionProvider = ({ children }) => {
  const [collection, setCollection] = useState(() => {
    const saved = localStorage.getItem('pokemon-collection');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('pokemon-wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('pokemon-collection', JSON.stringify(collection));
  }, [collection]);

  useEffect(() => {
    localStorage.setItem('pokemon-wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCollection = (card) => {
    if (!collection.find(c => c.id === card.id)) {
      setCollection([...collection, card]);
    }
  };

  const removeFromCollection = (cardId) => {
    setCollection(collection.filter(c => c.id !== cardId));
  };

  const addToWishlist = (card) => {
    if (!wishlist.find(c => c.id === card.id)) {
      setWishlist([...wishlist, card]);
    }
  };

  const removeFromWishlist = (cardId) => {
    setWishlist(wishlist.filter(c => c.id !== cardId));
  };

  const isInCollection = (cardId) => collection.some(c => c.id === cardId);
  const isInWishlist = (cardId) => wishlist.some(c => c.id === cardId);

  return (
    <CollectionContext.Provider value={{
      collection,
      wishlist,
      addToCollection,
      removeFromCollection,
      addToWishlist,
      removeFromWishlist,
      isInCollection,
      isInWishlist
    }}>
      {children}
    </CollectionContext.Provider>
  );
};

const useCollection = () => useContext(CollectionContext);

// Main App Component
export default function App() {
  const [currentView, setCurrentView] = useState('search');

  return (
    <CollectionProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-8 h-8" />
                <h1 className="text-2xl font-bold">PokéDex TCG</h1>
              </div>
              <nav className="flex gap-2">
                <button
                  onClick={() => setCurrentView('search')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentView === 'search' 
                      ? 'bg-white text-red-600 font-semibold' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Search
                </button>
                <button
                  onClick={() => setCurrentView('collection')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentView === 'collection' 
                      ? 'bg-white text-red-600 font-semibold' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Collection
                </button>
                <button
                  onClick={() => setCurrentView('wishlist')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentView === 'wishlist' 
                      ? 'bg-white text-red-600 font-semibold' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Wishlist
                </button>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {currentView === 'search' && <SearchView />}
          {currentView === 'collection' && <CollectionView />}
          {currentView === 'wishlist' && <WishlistView />}
        </main>
      </div>
    </CollectionProvider>
  );
}

// Search View Component
function SearchView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [typeFilter, setTypeFilter] = useState('');

  const pageSize = 20;

  useEffect(() => {
    searchCards();
  }, [page, typeFilter]);

  const searchCards = async () => {
    setLoading(true);
    try {
      let url = `https://api.pokemontcg.io/v2/cards?page=${page}&pageSize=${pageSize}`;
      
      const queries = [];
      if (searchQuery) queries.push(`name:"${searchQuery}*"`);
      if (typeFilter) queries.push(`types:${typeFilter}`);
      
      if (queries.length > 0) {
        url += `&q=${queries.join(' ')}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setCards(data.data || []);
      setTotalCount(data.totalCount || 0);
    } catch (error) {
      console.error('Error fetching cards:', error);
      setCards([]);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    setPage(1);
    searchCards();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const pokemonTypes = ['Grass', 'Fire', 'Water', 'Lightning', 'Psychic', 'Fighting', 'Darkness', 'Metal', 'Dragon', 'Fairy', 'Colorless'];

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-8 bg-white rounded-xl shadow-md p-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search Pokemon cards..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
          >
            Search
          </button>
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-semibold text-gray-700">Filter by Type:</span>
          <button
            onClick={() => setTypeFilter('')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              typeFilter === '' 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          {pokemonTypes.map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                typeFilter === type 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          <p className="mt-4 text-gray-600">Loading cards...</p>
        </div>
      )}

      {/* Cards Grid */}
      {!loading && cards.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {cards.map(card => (
              <CardThumbnail 
                key={card.id} 
                card={card} 
                onClick={() => setSelectedCard(card)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white rounded-lg shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="text-gray-700 font-semibold">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-white rounded-lg shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && cards.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No cards found. Try a different search!</p>
        </div>
      )}

      {/* Card Modal */}
      {selectedCard && (
        <CardModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </div>
  );
}

// Card Thumbnail Component
function CardThumbnail({ card, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer transform hover:scale-105 overflow-hidden"
    >
      <img
        src={card.images.small}
        alt={card.name}
        className="w-full h-auto"
      />
      <div className="p-3">
        <h3 className="font-semibold text-sm truncate">{card.name}</h3>
        <p className="text-xs text-gray-600">{card.set.name}</p>
      </div>
    </div>
  );
}

// Card Modal Component
function CardModal({ card, onClose }) {
  const { addToCollection, addToWishlist, isInCollection, isInWishlist } = useCollection();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{card.name}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Card Image */}
            <div>
              <img
                src={card.images.large}
                alt={card.name}
                className="w-full rounded-lg shadow-lg"
              />
            </div>

            {/* Card Details */}
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Basic Information</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-semibold">Set:</span> {card.set.name}</p>
                  <p><span className="font-semibold">Number:</span> {card.number}/{card.set.printedTotal}</p>
                  {card.supertype && <p><span className="font-semibold">Type:</span> {card.supertype}</p>}
                  {card.subtypes && <p><span className="font-semibold">Subtype:</span> {card.subtypes.join(', ')}</p>}
                  {card.types && <p><span className="font-semibold">Energy Type:</span> {card.types.join(', ')}</p>}
                  {card.hp && <p><span className="font-semibold">HP:</span> {card.hp}</p>}
                  {card.rarity && <p><span className="font-semibold">Rarity:</span> {card.rarity}</p>}
                </div>
              </div>

              {/* Attacks */}
              {card.attacks && card.attacks.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Attacks</h3>
                  {card.attacks.map((attack, idx) => (
                    <div key={idx} className="mb-3 last:mb-0">
                      <p className="font-semibold">{attack.name} {attack.damage && `- ${attack.damage}`}</p>
                      <p className="text-sm text-gray-600">{attack.text}</p>
                      {attack.cost && <p className="text-xs text-gray-500">Cost: {attack.cost.join(', ')}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Weaknesses & Resistances */}
              {(card.weaknesses || card.resistances) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Weaknesses & Resistances</h3>
                  {card.weaknesses && (
                    <p className="text-sm"><span className="font-semibold">Weakness:</span> {card.weaknesses.map(w => `${w.type} ${w.value}`).join(', ')}</p>
                  )}
                  {card.resistances && (
                    <p className="text-sm"><span className="font-semibold">Resistance:</span> {card.resistances.map(r => `${r.type} ${r.value}`).join(', ')}</p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => addToCollection(card)}
                  disabled={isInCollection(card.id)}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                    isInCollection(card.id)
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  <BookmarkPlus className="w-5 h-5" />
                  {isInCollection(card.id) ? 'In Collection' : 'Add to Collection'}
                </button>
                <button
                  onClick={() => addToWishlist(card)}
                  disabled={isInWishlist(card.id)}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                    isInWishlist(card.id)
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-purple-500 text-white hover:bg-purple-600'
                  }`}
                >
                  <Heart className="w-5 h-5" />
                  {isInWishlist(card.id) ? 'In Wishlist' : 'Add to Wishlist'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Collection View Component
function CollectionView() {
  const { collection, removeFromCollection } = useCollection();
  const [selectedCard, setSelectedCard] = useState(null);

  return (
    <div>
      <div className="mb-6 bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">My Collection</h2>
        <p className="text-gray-600">You have {collection.length} cards in your collection</p>
      </div>

      {collection.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <BookmarkPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Your collection is empty</p>
          <p className="text-gray-500 text-sm mt-2">Start adding cards from the search page!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {collection.map(card => (
            <div key={card.id} className="relative">
              <CardThumbnail card={card} onClick={() => setSelectedCard(card)} />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromCollection(card.id);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedCard && (
        <CardModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </div>
  );
}

// Wishlist View Component
function WishlistView() {
  const { wishlist, removeFromWishlist } = useCollection();
  const [selectedCard, setSelectedCard] = useState(null);

  return (
    <div>
      <div className="mb-6 bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">My Wishlist</h2>
        <p className="text-gray-600">You have {wishlist.length} cards on your wishlist</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Your wishlist is empty</p>
          <p className="text-gray-500 text-sm mt-2">Add cards you want to collect!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {wishlist.map(card => (
            <div key={card.id} className="relative">
              <CardThumbnail card={card} onClick={() => setSelectedCard(card)} />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromWishlist(card.id);
                }}
                className="absolute top-2 right-2 bg-purple-500 text-white p-2 rounded-full hover:bg-purple-600 shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedCard && (
        <CardModal card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </div>
  );
}