import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { MenubarModule } from 'primeng/menubar';
import { CardComponent } from './card/card.component';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SidebarComponent } from './sidebar/sidebar.component';
import { PanelMenuModule } from 'primeng/panelmenu';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SidebarItemComponent } from './sidebar/components/sidebar-item/sidebar-item.component';
import { VnwTableComponent } from './vnw-table/vnw-table.component';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { NgxMaskModule } from 'ngx-mask';
import { ToolbarModule } from 'primeng/toolbar';

@NgModule({
  declarations: [NavBarComponent, CardComponent, SidebarComponent, SidebarItemComponent, VnwTableComponent],
  imports: [
    CommonModule,
    MenubarModule,
    InputTextModule,
    ReactiveFormsModule,
    PanelMenuModule,
    FontAwesomeModule,
    ButtonModule,
    TableModule,
    NgxMaskModule,
    ToolbarModule,
  ],
  exports: [NavBarComponent, CardComponent, SidebarComponent, VnwTableComponent],
})
export class LayoutModule {}
