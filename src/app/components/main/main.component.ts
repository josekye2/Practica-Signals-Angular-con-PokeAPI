import { ChangeDetectionStrategy, Component, computed, effect, OnDestroy, signal } from '@angular/core';
import { PokeapiService } from '../../services/pokeapi.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Toast } from 'primeng/toast';
import { Ripple } from 'primeng/ripple';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast'


@Component({
  selector: 'app-main',
  imports: [
    ButtonModule, 
    CardModule,
    InputTextModule,
    FloatLabel,
    ProgressSpinnerModule,
    Toast,
    CommonModule,
    MatSnackBarModule,
    Ripple,
    ToastModule
  ],
  
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService]  
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
    private messageService: MessageService
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
          this.showBarError()
          this.loading.set(false)
        }
      })
    } else {
      this.showSinData()
    }
  }
 
  showBarError() {
    this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Nombre o id de pokemon no válido', life: 3000 });
  }
 
  showSinData() {
    this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Nombre o id de pokemon no válido', life: 3000 });
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
