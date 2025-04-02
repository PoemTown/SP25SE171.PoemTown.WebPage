import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CollectionManagement = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 9,
    totalPages: 1,
    totalRecords: 0
  });
  const [filters, setFilters] = useState({
    'filterOptions.collectionName': '',
    sortOptions: 2,
    pageNumber: 1,
    pageSize: 9
  });

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== '') queryParams.append(key, value);
        });

        const response = await axios.get(
          `https://api-poemtown-staging.nodfeather.win/api/collections/v1/community?${queryParams.toString()}`
        );
        
        if (response.data.statusCode === 200) {
          setCollections(response.data.data);
          setPagination({
            pageNumber: response.data.pageNumber,
            pageSize: response.data.pageSize,
            totalPages: response.data.totalPages,
            totalRecords: response.data.totalRecords
          });
        } else {
          setError('Failed to fetch collections');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [filters]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setFilters(prev => ({ ...prev, pageNumber: newPage }));
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, pageNumber: 1 }));
  };

  const resetFilters = () => {
    setFilters({
      'filterOptions.collectionName': '',
      sortOptions: 2,
      pageNumber: 1,
      pageSize: 10
    });
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "200px" }}>
        <div style={{ 
          border: "5px solid #f3f3f3", 
          borderTop: "5px solid #3498db", 
          borderRadius: "50%", 
          width: "50px", 
          height: "50px", 
          animation: "spin 1s linear infinite",
          marginBottom: "20px" 
        }}></div>
        <p>Loading collections...</p>
      </div>
    );
  }

  if (error) {
    return <div style={{ 
      color: "#e74c3c", 
      textAlign: "center", 
      padding: "20px", 
      backgroundColor: "#fadbd8", 
      borderRadius: "5px",
      maxWidth: "800px",
      margin: "20px auto"
    }}>Error: {error}</div>;
  }

  return (
    <div style={{ 
      maxWidth: "1200px", 
      margin: "0 auto", 
      padding: "20px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      <header style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ color: "#2c3e50", fontSize: "2.5rem", marginBottom: "10px" }}>Community Collections</h1>
        <p style={{ color: "#7f8c8d", fontSize: "1.1rem" }}>Browse community-created collections of poems and stories</p>
      </header>

      {/* Filter Section */}
      <div style={{ 
        display: "flex", 
        gap: "15px", 
        marginBottom: "20px", 
        flexWrap: "wrap",
        alignItems: "center"
      }}>
        <input
          type="text"
          placeholder="Search by collection name..."
          style={{ 
            padding: "8px 12px", 
            border: "1px solid #ddd", 
            borderRadius: "4px", 
            flex: "1", 
            minWidth: "200px" 
          }}
          value={filters['filterOptions.collectionName']}
          onChange={(e) => handleFilterChange('filterOptions.collectionName', e.target.value)}
        />
        
        <select
          style={{ 
            padding: "8px 12px", 
            border: "1px solid #ddd", 
            borderRadius: "4px", 
            backgroundColor: "white", 
            minWidth: "200px" 
          }}
          value={filters.sortOptions}
          onChange={(e) => handleFilterChange('sortOptions', parseInt(e.target.value))}
        >
          <option value={1}>Oldest to Newest</option>
          <option value={2}>Newest to Oldest</option>
        </select>
        
        {(filters['filterOptions.collectionName'] || filters.sortOptions !== 2) && (
          <button 
            style={{ 
              padding: "8px 16px", 
              backgroundColor: "#f0f0f0", 
              border: "1px solid #ddd", 
              borderRadius: "4px", 
              cursor: "pointer" 
            }} 
            onClick={resetFilters}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {(filters['filterOptions.collectionName'] || filters.sortOptions !== 2) && (
        <div style={{ 
          marginBottom: "20px", 
          padding: "10px 15px", 
          background: "#f0f2f5", 
          borderRadius: "4px" 
        }}>
          <strong>Active Filters:</strong>
          {filters['filterOptions.collectionName'] && (
            <span style={{ marginLeft: "10px" }}>
              Name: "{filters['filterOptions.collectionName']}"
            </span>
          )}
          {filters.sortOptions !== 2 && (
            <span style={{ marginLeft: "10px" }}>
              Sort: {filters.sortOptions === 1 ? 'Oldest to Newest' : 'Newest to Oldest'}
            </span>
          )}
        </div>
      )}

      {/* Collections List */}
      {collections.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          padding: "40px", 
          backgroundColor: "#f8f9fa", 
          borderRadius: "5px", 
          color: "#7f8c8d" 
        }}>
          <p>No collections found matching your criteria.</p>
          <button 
            style={{ 
              padding: "8px 16px",
              backgroundColor: "#3498db",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginTop: "10px"
            }} 
            onClick={resetFilters}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div style={{ 
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "25px",
            marginBottom: "30px"
          }}>
            {collections.map((collection) => (
              <div 
                key={collection.id} 
                style={{ 
                  background: "white",
                  borderRadius: "8px",
                  overflow: "hidden",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = ""}
              >
                <div style={{ width: "100%", height: "200px", overflow: "hidden" }}>
                  <img 
                    src={collection.collectionImage} 
                    alt={collection.collectionName}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                    }}
                  />
                </div>
                
                <div style={{ padding: "20px" }}>
                  <h2 style={{ margin: "0 0 10px 0", color: "#2c3e50", fontSize: "1.3rem" }}>
                    {collection.collectionName}
                  </h2>
                  <p style={{ 
                    color: "#7f8c8d", 
                    fontSize: "0.9rem", 
                    marginBottom: "15px",
                    display: "-webkit-box",
                    WebkitLineClamp: "3",
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden"
                  }}>
                    {collection.collectionDescription}
                  </p>
                  
                  <div style={{ display: "flex", gap: "15px", margin: "15px 0" }}>
                    <div style={{ textAlign: "center" }}>
                      <span style={{ display: "block", fontWeight: "bold", color: "#3498db", fontSize: "1.2rem" }}>
                        {collection.totalChapter}
                      </span>
                      <span style={{ display: "block", fontSize: "0.8rem", color: "#7f8c8d" }}>
                        Chapters
                      </span>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <span style={{ display: "block", fontWeight: "bold", color: "#3498db", fontSize: "1.2rem" }}>
                        {collection.totalRecord}
                      </span>
                      <span style={{ display: "block", fontSize: "0.8rem", color: "#7f8c8d" }}>
                        Poems
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    fontSize: "0.8rem", 
                    color: "#7f8c8d", 
                    marginTop: "15px", 
                    paddingTop: "15px", 
                    borderTop: "1px solid #ecf0f1" 
                  }}>
                    <span>Created by: {collection.user.userName}</span>
                    <span>{new Date(collection.createdTime).toLocaleDateString()}</span>
                  </div>
                  
                  {collection.isCommunity && (
                    <div style={{ 
                      display: "inline-block",
                      backgroundColor: "#2ecc71",
                      color: "white",
                      padding: "3px 10px",
                      borderRadius: "20px",
                      fontSize: "0.7rem",
                      marginTop: "10px",
                      fontWeight: "bold"
                    }}>
                      Community
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {pagination.totalPages > 1 && (
            <div style={{ 
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "20px",
              marginTop: "30px"
            }}>
              <button 
                style={{
                  padding: "8px 16px",
                  backgroundColor: pagination.pageNumber === 1 ? "#bdc3c7" : "#3498db",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: pagination.pageNumber === 1 ? "not-allowed" : "pointer"
                }}
                onClick={() => handlePageChange(pagination.pageNumber - 1)}
                disabled={pagination.pageNumber === 1}
              >
                Previous
              </button>
              
              <span style={{ color: "#2c3e50", fontWeight: "bold" }}>
                Page {pagination.pageNumber} of {pagination.totalPages}
              </span>
              
              <button 
                style={{
                  padding: "8px 16px",
                  backgroundColor: pagination.pageNumber === pagination.totalPages ? "#bdc3c7" : "#3498db",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: pagination.pageNumber === pagination.totalPages ? "not-allowed" : "pointer"
                }}
                onClick={() => handlePageChange(pagination.pageNumber + 1)}
                disabled={pagination.pageNumber === pagination.totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CollectionManagement;