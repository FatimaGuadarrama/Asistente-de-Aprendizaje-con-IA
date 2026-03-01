import React, { useState, useEffect } from 'react';
import flashcardService from '../../services/flashcardService';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import FlashcardSetCard from '../../components/flashcards/FlashcardSetCard';
import toast from 'react-hot-toast';

const FlashcardListPage = () => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashcardSets = async () => {
      try {
        const response = await flashcardService.getAllFlashcardSets();

        console.log("fetchFlashcardSets___", response.data);

        setFlashcardSets(response.data);
      } catch (error) {
        toast.error('No se pudieron obtener las Flashcards.');
        console.error(error);
      } finally {
        setLoading(false);
      }  
    };
    fetchFlashcardSets();
  }, []);
    
  const renderContent = () => {
    if (loading) {
      return <Spinner />;
    }

    if (flashcardSets. length === 0) {
      return (
        <EmptyState
          title="No se encontraron las Flashcards"
          description="Aún no has generado Flashcards. Ve a un documento para crear tu primer conjunto."
        />
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {flashcardSets.map((set) => (
          <FlashcardSetCard key={set._id} flashcardSet={set} />
        ))}
      </div>
    ) ;
  };
  return (
    <div>
      <PageHeader title="Todas tus Flashcards" />
      {renderContent()}
    </div>
  )
}


export default FlashcardListPage