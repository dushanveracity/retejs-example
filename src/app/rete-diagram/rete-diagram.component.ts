import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Injector,
} from '@angular/core';
import { ClassicPreset, GetSchemes, NodeEditor } from 'rete';
import { AngularArea2D, Presets, AngularPlugin } from 'rete-angular-plugin/15';
import { AreaExtensions, AreaPlugin, Area2D } from 'rete-area-plugin';
import {
  ConnectionPlugin,
  Presets as ConnectionPresets,
} from 'rete-connection-plugin';
import {
  ConnectionPathPlugin,
  Transformers,
} from 'rete-connection-path-plugin';
import { VerticalNodeComponent } from './components/vertical-node/vertical-node.component';
import { inverters, combinerBoxes, transformers } from './data/data';

type Schemes = GetSchemes<
  ClassicPreset.Node,
  ClassicPreset.Connection<ClassicPreset.Node, ClassicPreset.Node>
>;
type AreaExtra = AngularArea2D<Schemes>;

@Component({
  selector: 'app-rete-diagram',
  templateUrl: './rete-diagram.component.html',
  styles: [
    `
      .rete {
        width: 100vw;
        height: 100vh;
      }
    `,
  ],
})
export class ReteDiagramComponent implements AfterViewInit {
  constructor(private injector: Injector) {}
  @ViewChild('rete') container!: ElementRef;
  title = 'CodeSandbox';
  socket = new ClassicPreset.Socket('socket');
  editor = new NodeEditor<Schemes>();
  area: AreaPlugin<Schemes, AreaExtra> | null = null;
  connection = new ConnectionPlugin<Schemes, AreaExtra>();
  render = new AngularPlugin<Schemes, AreaExtra>({ injector: this.injector });
  pathPlugin = new ConnectionPathPlugin<Schemes, Area2D<Schemes>>({
    // curve: (c) => c.curve || curveStep // curveLinear
    transformer: () => Transformers.classic({ vertical: true, curvature: 0.5 }),
    arrow: () => true,
  });
  deviceList = {
    inverters: inverters,
    combinerboxes: combinerBoxes,
    transformers: transformers,
  };
  selected = {
    inverter: inverters[0],
    combinerbox: combinerBoxes[0],
    transformer: transformers[0],
  };

  async ngAfterViewInit(): Promise<void> {
    const pathPlugin = new ConnectionPathPlugin<Schemes, Area2D<Schemes>>({
      // curve: (c) => c.curve || curveStep // curveLinear
      transformer: () =>
        Transformers.classic({ vertical: true, curvature: 0.5 }),
      arrow: () => true,
    });
    this.area = new AreaPlugin<Schemes, AreaExtra>(
      this.container.nativeElement
    );

    // @ts-ignore
    this.render.use(pathPlugin);

    AreaExtensions.selectableNodes(this.area, AreaExtensions.selector(), {
      accumulating: AreaExtensions.accumulateOnCtrl(),
    });

    this.render.addPreset(
      Presets.classic.setup({
        customize: {
          node() {
            return VerticalNodeComponent;
          },
        },
      })
    );

    this.connection.addPreset(ConnectionPresets.classic.setup());

    this.editor.use(this.area);
    this.area.use(this.connection);
    this.area.use(this.render);

    AreaExtensions.simpleNodesOrder(this.area);

    const a = new ClassicPreset.Node('Solar Panel');
    a.addOutput('b', new ClassicPreset.Output(this.socket));
    a.addOutput('a', new ClassicPreset.Output(this.socket));
    await this.editor.addNode(a);

    const b = new ClassicPreset.Node('Inverter');
    b.addInput('c', new ClassicPreset.Input(this.socket));
    b.addInput('d', new ClassicPreset.Input(this.socket));
    b.addInput('b', new ClassicPreset.Input(this.socket));
    b.addOutput('a', new ClassicPreset.Output(this.socket));
    await this.editor.addNode(b);

    await this.area.translate(b.id, { x: 320, y: 0 });

    await this.editor.addConnection(
      new ClassicPreset.Connection(a, 'a', b, 'b')
    );

    AreaExtensions.zoomAt(this.area, this.editor.getNodes());
    // return () => area.destroy();
  }

  // adding components
  changeSelectedDevice(
    deviceData: any,
    type: 'inverter' | 'combinerbox' | 'transformer'
  ) {
    console.log(deviceData)
    this.selected[type] = deviceData;
  }

  addInverter() {
    console.log(this.selected);
    const inverter = new ClassicPreset.Node(this.selected.inverter.name);

    this.editor.addNode(inverter);
  }
}
