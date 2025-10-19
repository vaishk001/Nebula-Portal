
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface Query {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
  status: 'pending' | 'resolved' | 'rejected';
  response?: string;
}

const Queries = () => {
  const [queries, setQueries] = useState<Query[]>([]);
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [response, setResponse] = useState('');

  useEffect(() => {
    // Load queries from localStorage
    const storedQueries = localStorage.getItem('nebulaQueries');
    if (storedQueries) {
      try {
        const parsedQueries = JSON.parse(storedQueries);
        // Sort by timestamp (newest first)
        const sortedQueries = parsedQueries.sort((a: Query, b: Query) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setQueries(sortedQueries);
      } catch (e) {
        console.error("Error parsing queries:", e);
      }
    }
  }, []);

  const handleStatusUpdate = (queryId: string, newStatus: 'resolved' | 'rejected') => {
    if (!selectedQuery) return;
    
    // Update query in state
    const updatedQueries = queries.map(query => {
      if (query.id === queryId) {
        return { 
          ...query, 
          status: newStatus,
          response: response.trim() || undefined
        };
      }
      return query;
    });
    
    setQueries(updatedQueries);
    
    // Update localStorage
    localStorage.setItem('nebulaQueries', JSON.stringify(updatedQueries));
    
    // Reset selected query and response
    setSelectedQuery(null);
    setResponse('');
  };

  if (queries.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">No queries from users yet</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {selectedQuery ? (
        <div className="space-y-4">
          <div className="nebula-card p-4">
            <div className="flex justify-between mb-2">
              <h3 className="font-medium">{selectedQuery.userName}</h3>
              <span className="text-xs text-muted-foreground">
                {format(new Date(selectedQuery.timestamp), 'MMM dd, yyyy HH:mm')}
              </span>
            </div>
            <p className="text-sm mb-4">{selectedQuery.text}</p>
            
            <div>
              <label className="nebula-label">Your Response</label>
              <textarea
                className="nebula-input w-full min-h-[100px] mb-4"
                placeholder="Type your response here..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
              ></textarea>
            </div>
            
            <div className="flex justify-between">
              <button 
                onClick={() => setSelectedQuery(null)}
                className="nebula-button bg-secondary hover:bg-secondary/80"
              >
                Cancel
              </button>
              <div className="space-x-2">
                <button 
                  onClick={() => handleStatusUpdate(selectedQuery.id, 'rejected')}
                  className="nebula-button bg-red-500/20 text-red-500 hover:bg-red-500/30"
                >
                  Reject
                </button>
                <button 
                  onClick={() => handleStatusUpdate(selectedQuery.id, 'resolved')}
                  className="nebula-button bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30"
                >
                  Resolve
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {queries.map(query => (
            <div 
              key={query.id} 
              className="nebula-card p-4 cursor-pointer hover:bg-secondary/10 transition-colors"
              onClick={() => {
                setSelectedQuery(query);
                setResponse(query.response || '');
              }}
            >
              <div className="flex justify-between mb-2">
                <h3 className="font-medium flex items-center gap-2">
                  {query.userName}
                  {query.status === 'pending' && (
                    <span className="nebula-badge badge-incomplete">Pending</span>
                  )}
                  {query.status === 'resolved' && (
                    <span className="nebula-badge badge-complete">Resolved</span>
                  )}
                  {query.status === 'rejected' && (
                    <span className="nebula-badge bg-red-500/20 text-red-500">Rejected</span>
                  )}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(query.timestamp), 'MMM dd, yyyy')}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">{query.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Queries;
