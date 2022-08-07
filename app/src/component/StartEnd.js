import React from "react";
import { Link } from "react-router-dom";

const StartEnd = (props) => {
  const btn = {
    display: "block",
    padding: "21px",
    margin: "7px",
    minWidth: "max-content",
    textAlign: "center",
    width: "333px",
    alignSelf: "center",
  };
  return (
    <div
      className="container-main"
      style={{ borderTop: '1px solid', marginTop: '0px' }}
    >
      {!props.elStarted ? (
        <>
          {/* edit here to display start newsDetection Again button */}
          {!props.elEnded ? (
            <>
              <div
                className="container-item bg-slate-900 p-10"
                style={{ display: 'block' }}
              >
                <h2 className="text-sky-600">Do not forget to add news.</h2>
                <p className="text-sky-600">
                  Go to{' '}
                  <Link
                    title="Add a new "
                    to="/addNews"
                    style={{
                      color: 'white',
                      textDecoration: 'underline',
                    }}
                  >
                    add news
                  </Link>{' '}
                  page.
                </p>
              </div>
              <div className="container-item font-semibold text-xl text-sky-600">
                <button type="submit" style={btn}>
                  Start newsDetection {props.elEnded ? 'Again' : null}
                </button>
              </div>
            </>
          ) : (
            <div className="container-item text-white">
              <center>
                <p>Re-deploy the contract to start newsDetection again.</p>
              </center>
            </div>
          )}
          {props.elEnded ? (
            <div className="container-item text-white">
              <center>
                <p>The newsDetection ended.</p>
              </center>
            </div>
          ) : null}
        </>
      ) : (
        <>
          <div className="container-item text-white">
            <center>
              <p>The newsDetection started.</p>
            </center>
          </div>
          <div className="container-item text-white">
            <button
              type="button"
              // onClick={this.endnewsDetection}
              onClick={props.endElFn}
              style={btn}
            >
              End
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default StartEnd;
