import React, { createContext, useState, useContext } from 'react';

const BookContext = createContext();

export const BookProvider = ({ children }) => {
  const [books, setBooks] = useState([
    {
      id: '1',
      title: 'Sample Book 1',
      author: 'Author 1',
      description: 'This is a sample book description',
      price: 9.99,
      coverImage: '/images/no-cover.png',
      status: 'available'
    },
    {
      id: '2',
      title: 'Sample Book 2',
      author: 'Author 2',
      description: 'Another sample book description',
      price: 14.99,
      coverImage: '/images/no-cover.png',
      status: 'available'
    }
  ]);

  const addBook = (book) => {
    setBooks([...books, { ...book, id: Date.now().toString() }]);
  };

  const updateBook = (id, updatedBook) => {
    setBooks(books.map(book => book.id === id ? { ...book, ...updatedBook } : book));
  };

  const deleteBook = (id) => {
    setBooks(books.filter(book => book.id !== id));
  };

  return (
    <BookContext.Provider value={{ books, addBook, updateBook, deleteBook }}>
      {children}
    </BookContext.Provider>
  );
};

export const useBook = () => {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('useBook must be used within a BookProvider');
  }
  return context;
}; 