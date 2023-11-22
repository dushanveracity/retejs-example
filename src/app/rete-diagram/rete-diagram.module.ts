import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReteModule } from "rete-angular-plugin/16";
import { ReteDiagramComponent } from "./rete-diagram.component";
import { VerticalNodeComponent } from './components/vertical-node/vertical-node.component';
import { FormsModule } from "@angular/forms";


@NgModule({
  declarations: [ReteDiagramComponent, VerticalNodeComponent],
  imports: [CommonModule, ReteModule, FormsModule],
  exports: [ReteDiagramComponent]
})
export class MyReteEditorModule {}
