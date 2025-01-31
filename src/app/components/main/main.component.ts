import { ChangeDetectionStrategy, Component, computed, effect, OnDestroy, signal } from '@angular/core';
import { PokeapiService } from '../../services/pokeapi.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main',
  imports: [
    ButtonModule, 
    CardModule,
    InputTextModule,
    FloatLabel,
    ProgressSpinnerModule,
    ToastModule,
    CommonModule
  ],
  
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainComponent implements OnDestroy{
  pokemonNameOrId = signal('');
  loading = signal(false);
  pokemonData = signal<any>(null);
  indiceActual = signal(0);
  animationArray = signal<string[]>([]);
  animating = signal(false);

  imagenActual = computed(() => {
    const array = this.animationArray();
    return array.length > 0 ? array[this.indiceActual()] : '';
  });
 
  constructor( 
    private pokemonService: PokeapiService,
 // private _snackBar: MatSnackBar IMPORTANTE!!!!
    ){
      effect(() => {
        if (this.animating()) {
          this.animateFrames();
        }
      });
    }
  ngOnDestroy(): void {
    this.detenerAnimacion();
  }
 
  playSound(soundSource: string){
    const audio = new Audio();
    audio.src = soundSource;
    audio.load();
    audio.play();
  }
 
  loadPokemon(){
    if(this.pokemonNameOrId().length > 0){
      this.detenerAnimacion();
      this.loading.set(true);
      this.pokemonService.getPokemon(this.pokemonNameOrId()).subscribe({
        next: (pokemon: any) =>{  
          this.pokemonData.set(pokemon);
          this.loading.set(false);
          console.log(this.pokemonData());
          this.animationArray.set([
            pokemon.sprites.front_default,
            pokemon.sprites.back_default
          ]);
          this.iniciarAnimacion();
          this.playSound(this.pokemonData().cries.latest)
        },
        error: (err: any) =>{ 
          console.log(err)
          this.openSnackBarError()
          this.loading.set(false)
        }
      })
    } else {
      this.openSnackSinData()
    }
  }
 
  openSnackBarError() {
   // this._snackBar.open( 'Nombre o id de pokemon no válido', 'Cerrar', {duration: 3000} );
   console.log('Nombre o id de pokemon no válido');
  }
 
  openSnackSinData() {
   // this._snackBar.open( 'Escriba un nombre o id para cargar', 'Cerrar', {duration: 3000} );
   console.log('Escriba un nombre o id para cargar');
  }
 
  iniciarAnimacion() {
    this.indiceActual.set(0);
    this.animating.set(true);
  }
 
  animateFrames() {
    setTimeout(() => {
      if (this.animating()) {
        this.indiceActual.update(index => (index + 1) % this.animationArray().length);
        this.animateFrames();
      }
    }, 300);
  }
 
  detenerAnimacion() {
    this.animating.set(false);
  }
  updateName(name: string) {
    this.pokemonNameOrId.set(name.toLocaleLowerCase());
  }
  
}
