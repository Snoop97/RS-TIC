import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute, Params } from "@angular/router";
import { User } from '../../models/user';
import { UserService } from "../../services/user.service";
import { Follow } from "../../models/follow";
import { FollowService } from "../../services/follow.service";
import { GLOBAL } from "../../services/global";

@Component({
    selector: 'users',
    templateUrl: './users.component.html',
    providers: [UserService, FollowService]
})
export class UsersComponent implements OnInit{
  public title: string;
  public url: string;
  public identity;
  public token;
  public page;
  public nextPage;
  public prevPage;
  public total;
  public pages;
  public users: User[];
  public status: string;
  public follows;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService,
    private _followService: FollowService
  ) {
    this.title = 'Personas';
    this.url = GLOBAL.url;
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
  }
  ngOnInit() {
   console.log("users.component ha sido cargado.");
   this.actualPage();
  }

  actualPage(){
    this._route.params.subscribe(params =>{
      let page = params['page'];
      this.page = page;

      if(!params['page']){
        page = 1;
      }

      if(!page){
        page = 1;
      }else{
        this.prevPage = page-1;
        this.nextPage = page+1;

        if(this.prevPage <= 0){
          this.prevPage = 1;
        }
      }
      //DEVOLVER LISTADO DE USUARIOS
      this.getUsers(page);
    });
  }


  getUsers(page){
    this._userService.getUsers(page).subscribe(
      response => {
          if(!response.users){
              this.status = 'error';
          }else{
            this.total = response.total;
            this.users = response.users;
            this.pages = response.pages;
            this.follows = response.users_following;

            console.log(this.follows);
            if(page > this.pages){
              this._router.navigate(['/persona', 1]);
            }
          }
      }, error => {
          var errorMessage = <any>error;
          console.log(errorMessage);

          if(errorMessage != null){
            this.status = 'error';
          }
      });
  }

  public followUserOver;
  mouseEnter(user_id){
    this.followUserOver = user_id;
  }

  mouseLeave(user_id){
    this.followUserOver = 0;
  }

  followUser(followed){
    var follow = JSON.parse('{ "_id":"\'\'", "user":"'+this.identity._id+'", "followed":"'+followed+'" }');

    this._followService.addFollow(this.token, follow).subscribe(
      response => {
        if(!response.follow){
          this.status = 'error';
        }else{
          this.status = 'success';
          this.follows.push(followed);
        }
      },
      error => {
        var errorMessage = <any>error;
        console.log(errorMessage);

        if(errorMessage != null){
          this.status = 'error';
        }
      }
    );


  }

}

