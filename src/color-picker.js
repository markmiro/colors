import React from 'react';
import {render} from 'react-dom';
import husl from 'husl';
import d3 from 'd3-color';
import chroma from 'chroma-js';

import ms from './modules/common/ms';
import Gradient from './modules/Gradient';
import g from './modules/common/gradient';
import Fill from './modules/Fill';
import SpacedFlexbox from './modules/SpacedFlexbox';
import Button from './modules/Button';
import {
  huslFunc,
  huslpFunc,
  hsvFunc,
  hslFunc,
  hclFunc,
  hclExtendedFunc,
  hueClip,
  saturationClip,
  lightnessClip,
  mousePositionElement
} from './modules/colorPickerUtils';

const w = 100;
const h = 100;
const boxSize = 500;
const border = '2px solid ' + g.base(1);
// const hslProxy = husl;

// This type of func can be set to use HSL, HCL, HUSL, and HUSLp
// const hslProxy = hclFunc;
// window.hslProxy = hslProxy;

const HueSlider = React.createClass({
  getInitialState () {
    return {
      isDragging: false
    };
  },
  render () {
    const sliderThickness = 50;
    return (
      <div style={{border, position: 'relative'}}>
        <canvas
          ref="canvas"
          width={1}
          height={this.props.hslProxy.resolution}
          onMouseDown={e => {
            this.propogateChange(e);
            let moveListener = this.propogateChange;
            let upListener = e => {
              this.setState({isDragging: false});
              document.removeEventListener('mouseup', upListener, false);
              document.removeEventListener('mousemove', moveListener, false);
            };
            document.addEventListener('mouseup', upListener, false);
            document.addEventListener('mousemove', moveListener, false);
          }}
          style={{
            width: sliderThickness,
            height: boxSize,
          }}
        />
        <div style={{
          pointerEvents: 'none',
          height: 4,
          width: '100%',
          backgroundColor: g.base(0),
          borderTop: border,
          position: 'absolute',
          transform: 'translateY(-50%)',
          left: 0,
          top: boxSize * (this.props.hue / 360)
        }} />
      </div>
    );
  },
  componentDidMount () {
    this.drawCanvas();
  },
  componentDidUpdate () {
    this.drawCanvas();
  },
  propogateChange (e) {
    const y = mousePositionElement(e).y;
    const newHue = hueClip((y / boxSize) * 360);
    this.props.onChange(newHue);
  },
  drawCanvas () {
    var canvas = this.refs.canvas;
    if (!canvas.getContext) return;

    var ctx = canvas.getContext('2d');
    var imageData = ctx.createImageData(1, canvas.height);
    var data = imageData.data;

    for (let y = 0, i = -1; y < this.props.hslProxy.resolution; ++y) {
      const hue = (y  / this.props.hslProxy.resolution) * 360;
      const saturation = 100;
      const color = this.props.hslProxy.toRGB(hue, this.props.saturation, this.props.lightness);

      data[++i] = color[0] * 255;
      data[++i] = color[1] * 255;
      data[++i] = color[2] * 255;
      data[++i] = 255; // not transparent
    }
    ctx.putImageData(imageData, 0, 0);
  }
});

const ColorPin = React.createClass({
  render () {
    const {saturation, lightness} = this.props;
    return (
      <div style={{
        pointerEvents: 'none',
        width: 10,
        height: 10,
        position: 'absolute',
        transform: 'translate(-50%, -50%)',
        boxShadow: '2px 2px ' + g.base(0),
        // left: 0,
        // top: 0,
        left: boxSize * (saturation / 100),
        top: boxSize * ((100 - lightness) / 100),
        border
      }}/>
    );
  }
});

const ColorPicker = React.createClass({
  getInitialState () {
    return {
      hslProxy: huslFunc,
      hue: 50,
      saturation: 50,
      lightness: 50
    };
  },
  render () {
    const {hue, saturation, lightness, hslProxy} = this.state;
    return (
      <SpacedFlexbox spacing={ms.spacing(0)} style={{flexDirection: 'column'}}>
        <SpacedFlexbox spacing={ms.spacing(0)}>
          <div style={{position: 'relative', border}}>
            <canvas
              ref="canvas"
              onMouseDown={e => {
                this.updateColor(e);
                let moveListener = this.updateColor;
                let upListener = e => {
                  this.setState({isDragging: false});
                  document.removeEventListener('mouseup', upListener, false);
                  document.removeEventListener('mousemove', moveListener, false);
                };
                document.addEventListener('mouseup', upListener, false);
                document.addEventListener('mousemove', moveListener, false);
              }}
              width={hslProxy.resolution}
              height={hslProxy.resolution}
              style={{
                width: boxSize,
                height: boxSize
              }}
            />
            <ColorPin ref="colorPin" saturation={saturation} lightness={lightness} />
          </div>
          <HueSlider
            hslProxy={hslProxy}
            hue={hue}
            lightness={lightness}
            saturation={saturation}
            onChange={hue => this.setState({hue})}
          />
          <HueSlider
            hslProxy={hslProxy}
            hue={hue}
            lightness={60}
            saturation={hslProxy.referenceSaturation}
            onChange={hue => this.setState({hue})}
          />
          <SpacedFlexbox spacing={ms.spacing(0)} style={{flexDirection: 'column'}}>
            <div style={{
              backgroundColor: hslProxy.toHex(hue, saturation, lightness),
              width: 200,
              height: 200,
              border
            }} />
            <div className="selectable" style={{
              textTransform: 'uppercase',
            }}>
              {hslProxy.toHex(hue, saturation, lightness)}
            </div>
          </SpacedFlexbox>
        </SpacedFlexbox>
        <SpacedFlexbox spacing={ms.spacing(0)}>
          <Button g={g} onClick={() =>
            this.setState({
              hslProxy: hsvFunc,
              ...(hsvFunc.fromHex(hslProxy.toHex(hue, saturation, lightness)))
            })
          }>
            HSV
          </Button>
          <Button g={g} onClick={() =>
            this.setState({
              hslProxy: hslFunc,
              ...(hslFunc.fromHex(hslProxy.toHex(hue, saturation, lightness)))
            })
          }>
            HSL
          </Button>
          <Button g={g} onClick={() =>
            this.setState({
              hslProxy: hclFunc,
              ...(hclFunc.fromHex(hslProxy.toHex(hue, saturation, lightness)))
            })
          }>
            HCL
          </Button>
          <Button g={g} onClick={() =>
            this.setState({
              hslProxy: hclExtendedFunc,
              ...(hclExtendedFunc.fromHex(hslProxy.toHex(hue, saturation, lightness)))
            })
          }>
            HCL Extended
          </Button>
          <Button g={g} onClick={() =>
            this.setState({
              hslProxy: huslFunc,
              ...(huslFunc.fromHex(hslProxy.toHex(hue, saturation, lightness)))
            })
          }>
            HUSL
          </Button>
          <Button g={g} onClick={() =>
            this.setState({
              hslProxy: huslpFunc,
              ...(huslpFunc.fromHex(hslProxy.toHex(hue, saturation, lightness)))
            })
          }>
            HUSLp
          </Button>
        </SpacedFlexbox>
      </SpacedFlexbox>
    );
  },
  componentDidMount () {
    this.drawCanvas();
  },
  componentDidUpdate () {
    this.drawCanvas();
  },
  updateColor (e) {
    const {x, y} = mousePositionElement(e);
    const newHue = hueClip(this.state.hue);
    const newSaturation = saturationClip((x / boxSize) * 100);
    const newLightness = lightnessClip(100 - (y / boxSize) * 100);
    this.setState({
      hue: newHue,
      saturation: newSaturation,
      lightness: newLightness
    });
  },
  drawCanvas () {
    var canvas = this.refs.canvas;
    if (!canvas.getContext) return;

    var ctx = canvas.getContext('2d');
    // debugger;
    var imageData = ctx.createImageData(canvas.width, canvas.height);
    var data = imageData.data;

    const {hue, hslProxy} = this.state;
    let i = 0;
    for (let y = 0; y < hslProxy.resolution; y++) {
      for (let x = 0; x < hslProxy.resolution; x++) {
        const saturation = x / hslProxy.resolution * 100;
        const lightness =  100 - (y / hslProxy.resolution * 100);
        const color = hslProxy.toRGB(hue, saturation, lightness);

        data[0 + i * 4] = color[0] * 255;
        data[1 + i * 4] = color[1] * 255;
        data[2 + i * 4] = color[2] * 255;
        data[3 + i * 4] = 255; // not transparent
        i++;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }
});

const App = React.createClass({
  render () {
    return (
      <Fill style={{
        padding: ms.spacing(8)
      }}>
        <h1 style={{marginBottom: ms.spacing(0)}}>
          Color Picker
        </h1>
        <ColorPicker />
      </Fill>
    );
  }
});

render(<App />, document.getElementById('root'));
