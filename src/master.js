import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import axios from 'axios';
import Typography from '@mui/material/Typography';

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const centerPanel = keyframes`
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.5);
  }
`;

const animationDuration = '1s'; // Animation duration

const AnimatedBox = styled(Box)(({ theme, animation, duration, selected }) => ({
  animation: `${animation} ${duration || animationDuration} ease-in-out forwards`,
  border: selected ? '2px solid blue' : 'none',
  position: 'relative',
}));

const TickIcon = styled(CheckCircleOutlineIcon)({
  position: 'absolute',
  top: -10,
  right: -10,
  color: 'green',
  fontSize: 40,
  opacity: 0,
  animation: `${fadeIn} 0.5s forwards`,
});

const LoadingOverlay = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: 1500,
});

const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const MySpinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid  white;
  width: 40px;
  height: 40px;
  animation: ${rotate} 2s linear infinite;
`;

// Modal Style
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function MasterPage() {
  const [panelState, setPanelState] = useState('input');
  const [selectedPanel, setSelectedPanel] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [storedResponse, setStoredResponse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState('');

  // State for input fields
  const [diagnose, setDiagnose] = useState('');
  const [cause, setCause] = useState('');
  const [solution, setSolution] = useState('');

  useEffect(() => {
    if (error) {
      alert('An error occurred: ' + error); // Display error message
      setError(null); // Reset error after displaying
    }
  }, [error]);

  const handleOpenModal = (content) => {
    setModalContent(content);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSummarizeClick = () => {
    setLoading(true);
    setPanelState('fading');
    setError(null);
  
    axios.post('https://api.yomo.ooo/api/summarize/', { diagnose, cause, solution })
      .then(response => {
        const responseData = response.data;
        // Check for stored response
        if (responseData['Stored Response']) {
          setStoredResponse(responseData['Stored Response']);
        }
        const newSuggestions = Object.keys(responseData).map((key, index) => {
          return responseData[key];
        });
  
        setSuggestions(newSuggestions);
        setPanelState('suggestions');
      })
      .catch(error => {
        console.error('Error fetching suggestions:', error);
        setError('Failed to fetch suggestions. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const regenerateSuggestions = () => {
    handleSummarizeClick(); // Re-use the existing function to make the API call
  };
    
  const handlePanelSelect = (index) => {
    setSelectedPanel(index);
    setSelectedSuggestion(index);
    setPanelState('selected');
    setStoredResponse(null); // Clear the stored response when a suggestion is selected  
  };

// This function confirms the selection and moves to the selected panel
const confirmSelection = () => {
  if (selectedPanel !== null) {
    setSelectedSuggestion(selectedPanel); // Ensure selected suggestion is set
    setPanelState('selected');
  }
};

  const checkForStoredResponse = () => {
    setLoading(true);
    axios.post('https://api.yomo.ooo/api/check-response/', { diagnose, cause, solution })
      .then(response => {
        const { diagnose, cause, solution, selected_response } = response.data;
        
        const formattedResponse = (
          <div>
            <Typography variant="subtitle1"><b>Diagnose:</b> <br/>{diagnose}</Typography>
            <Typography variant="subtitle1"><b>Cause:</b> <br/>{cause}</Typography>
            <Typography variant="subtitle1"><b>Solution:</b> <br/>{solution}</Typography>
            <Typography variant="subtitle1"><b>Selected Response:</b> <br/>{selected_response}</Typography>
          </div>
        );
    
        handleOpenModal(formattedResponse);
       })
      .catch(error => {
        if (error.response && error.response.status === 404) {
          alert('No stored response found.');
        } else {
          console.error('Error:', error);
          setError('Failed to check for stored response. Please try again.');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

// Function to handle the save action
const handleSaveClick = () => {
  const payload = {
    diagnose: diagnose,
    cause: cause,
    solution: solution,
    selected_response: suggestions[selectedSuggestion]
  };

  axios.post('https://api.yomo.ooo/api/store-response/', payload)
    .then(response => {
      // Handle successful response
      alert('Response saved successfully. The page will refresh in 2 seconds.');

      // Set a timeout to refresh the page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 1250);
    })
    .catch(error => {
      // Handle error
      console.error('Error saving the response:', error);
      setError('Failed to save the response. Please try again.');
    });
};

const handleBackToSuggestions = () => {
  setPanelState('suggestions');
};

  return (
    <React.Fragment>
      {isLoading && (
        <LoadingOverlay>
        <MySpinner/>
        </LoadingOverlay>
      )}

      {/* Initial input panel */}
      {panelState === 'input' && 
      (
        <AnimatedBox
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            width: 600,
            margin: '50px auto',
          }}
        >
          <TextField multiline rows={5} label="Diagnose" variant="outlined" value={diagnose} onChange={(e) => setDiagnose(e.target.value)}/>
          <TextField multiline rows={3} label="Cause" variant="outlined"  value={cause} onChange={(e) => setCause(e.target.value)}/>
          <TextField multiline rows={3} label="Solution" variant="outlined"  value={solution} onChange={(e) => setSolution(e.target.value)}/>
          <Button variant="contained" onClick={handleSummarizeClick} sx={{ mt: 2 }}>
            Summarize
          </Button>      
          {/* Button to Check for Stored Response */}
        <Button
        variant="contained"
        color="primary"
        onClick={checkForStoredResponse}
        sx={{ mt: 2 }}
      >
        Check Stored Responses
      </Button>

      {/* Modal for displaying stored response */}
      <Modal
        open={showModal}
        onClose={handleCloseModal}
        aria-labelledby="stored-response-modal"
        aria-describedby="stored-response-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="stored-response-modal-title" variant="h5" component="h2">
            <b><i>Stored Response</i></b>
          </Typography><br/>
          <div id="stored-response-modal-description" sx={{ mt: 2 }}>
            {modalContent}
          </div>
          <Button onClick={handleCloseModal}>Close</Button>
        </Box>
      </Modal>

        </AnimatedBox>
      )}

      {/* Suggestions panel */}
      {panelState === 'suggestions' && (
  <>
    <div style={{ marginBottom: "75vh", background: "white", textAlign: "left", padding: "15px", borderRadius: "15px", fontSize: "12px" }}>
      <Typography variant="h6"><b>Diagnose:</b> {diagnose}</Typography>
      <Typography variant="h6"><b>Cause:</b> {cause}</Typography>
      <Typography variant="h6"><b>Solution:</b> {solution}</Typography>
    </div>
    <Box
      sx={{
        position: 'absolute',
        bottom: '25vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        height: '55vh',
      }}
    >
      {suggestions.map((suggestion, index) => (
        <AnimatedBox
          key={`suggestion-${index}`}
          selected={selectedPanel === index}
          onClick={() => setSelectedPanel(index)}
          animation={fadeIn}
          sx={{
            border: selectedPanel === index ? '2px solid blue' : 'none',
            // other styling properties
          }}
        >
          <TextField
            multiline
            rows={8}
            placeholder={`Suggestion ${index + 1}`}
            style={{
              width: '400px',
              fontSize: '18px',
            }}
            value={suggestion}
          />
        </AnimatedBox>
      ))}
      {/* OK Button to confirm selection */}
      {selectedPanel !== null && (
        <Box
          sx={{
            position: 'absolute',
            right: 75,
            bottom: 50,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={confirmSelection}
          >
            OK
          </Button>
        </Box>
      )}
      {/* Regenerate Button at bottom right */}
      <Box
        sx={{
          position: 'absolute',
          right: 75,
          bottom: 10,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={regenerateSuggestions}
        >
          Regenerate
        </Button>
      </Box>
    </Box>
  </>
)}
      {/* Selected panel */}
      {panelState === 'selected' && (
        <>
        <div style={{marginBottom: "75vh", background: "white", textAlign: "left", padding: "15px", borderRadius: "15px", fontSize: "12px"}}>
        <Typography variant="h6"><b>Diagnose:</b>  {diagnose}</Typography>
        <Typography variant="h6"><b>Cause:</b>  {cause}</Typography>
        <Typography variant="h6"><b>Solution:</b>  {solution}</Typography>
      </div>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <AnimatedBox
            sx={{
              padding: '3vh',
              width: '50vw',
              height: '10vw',
              backgroundColor: '#fff',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between', // Align items to the edges
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 2,
            }}
            animation={centerPanel}
            duration="0.5s"
          >
            <TickIcon style={{ opacity: 1 }} />
            <TextField
              multiline
              rows={3}
              label={`Suggestion ${selectedSuggestion + 1}`}
              variant="outlined"
              fullWidth
              margin="normal"
              value={suggestions[selectedSuggestion]}
              onChange={(e) => {
                const updatedSuggestions = [...suggestions];
                updatedSuggestions[selectedSuggestion] = e.target.value;
                setSuggestions(updatedSuggestions);
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveClick}
            >
              Save
            </Button>
          </AnimatedBox>
        </Box>
          {/* Back Button */}
        <Button
          variant="contained"
          color="success"
          onClick={handleBackToSuggestions}
          sx = {{bottom: "18vh"}}
        >
          Back to Suggestions
        </Button>
        </>
      )}
    </React.Fragment>
  );
}

export default MasterPage;
