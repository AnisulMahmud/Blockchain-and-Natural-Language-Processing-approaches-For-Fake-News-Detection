import React from "react";

const DetectionStatus = (props) => {
  const detectionStatus = {
    padding: "11px",
    margin: "7px",
    width: "100%",
    marginLeft: "auto",
    marginRight: "auto",
    textAlign: "center",
    borderRadius: "0.5em",
    overflow: "auto",
    alignItems: "center",
    justifyContent: "space-around",
    display: "flex",
  };
  return (
    <div
      className="container-main"
      style={{ borderTop: '1px solid', marginTop: '0px' }}
    >
      <h3 className="text-white text-lg">NewsDetection Status</h3>
      <div className="border border-teal-600" style={detectionStatus}>
        <p className="text-white">
          Started: {props.elStarted ? 'True' : 'False'}
        </p>
        <p className="text-white">Ended: {props.elEnded ? 'True' : 'False'}</p>
      </div>
      <div className="container-item" />
    </div>
  );
};

export default DetectionStatus;
