import { CgGenderMale, CgGenderFemale } from 'react-icons/cg';
import { Card, Row, Col, Avatar } from 'antd';
import { useNavigate } from 'react-router-dom';

// Add this component above your SearchPage component
const UserCard = ({ user }) => {
    const navigate = useNavigate();
    
    return (
      <Card
        hoverable
        style={{
          width: '100%',
          height: '100%', // Make cards fill grid row height
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
          display: 'flex',
          flexDirection: 'column'
        }}
        bodyStyle={{ 
          padding: '16px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column' 
        }}
        onClick={() => navigate(`/user/${user.userName}`)}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 16,
          flex: 1,
          minHeight: 0 // Important for child element overflow
        }}>
          <Avatar
            src={user.avatar}
            style={{
              width: 60,
              height: 60,
              flexShrink: 0
            }}
            onError={() => true}
          >
            {user.displayName?.charAt(0)}
          </Avatar>
          
          <div style={{ 
            flex: 1,
            minWidth: 0, // Allows text truncation
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 4
              }}>
                <h4 style={{
                  margin: 0,
                  fontSize: 16,
                  lineHeight: '1.3',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {user.displayName}
                </h4>
                {user.gender?.toLowerCase() === "male" && <CgGenderMale size={20} style={{ color: '#1890ff' }} />}
                {user.gender?.toLowerCase() === "female" && <CgGenderFemale size={20} style={{ color: '#ff4d4f' }} />}
              </div>
              
              <p style={{ 
                margin: 0,
                color: '#666',
                fontSize: 14,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                @{user.userName}
              </p>
            </div>
  
            <p style={{ 
              margin: 0,
              color: '#888',
              fontSize: 13,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              Có {user.totalFollowers || 0} người theo dõi
            </p>
          </div>
        </div>
      </Card>
    );
  };
  

export default UserCard;