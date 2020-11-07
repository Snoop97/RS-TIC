import{ Component, OnInit} from "@angular/core";
import{ Router, ActivatedRoute, Params } from "@angular/router";
import{ User } from "../../models/user";
import{ UserService } from "../../services/user.service";
import {Observable} from "rxjs";
import {HttpHeaders} from "@angular/common/http";

@Component({
  selector: 'chart',
  templateUrl: './chart.component.html'
})

export class ChartComponent implements OnInit{

  constructor(

  ) {

  }
  ngOnInit(){
    console.log('Componente de login cargado...');
  }
}
