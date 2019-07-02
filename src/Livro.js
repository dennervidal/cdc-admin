import React, { Component } from 'react';
import $ from 'jquery';
import InputCustomizado from './componentes/InputCustomizado';
import PubSub from 'pubsub-js';
import TratadorErros from './TratadorErros';

class FormularioLivro extends Component {
    constructor(){
        super();
        this.state = {titulo: '', preco: '', autorId: ''};
    }

    enviaForm(evento){
        evento.preventDefault();
        $.ajax({
            url: "http://localhost:8080/api/livros",
            contentType: "application/json",
            dataType: 'json',
            type: 'post',
            data: JSON.stringify({titulo: this.state.titulo, preco: this.state.preco, autorId: this.state.autorId}),
            success: function(resposta){
                this.props.callbackAtualizaListagem(resposta);
                //PubSub.publish('atualiza-lista-autores', resposta);
                this.setState({titulo: '', preco: '', autorId: ''});
            }.bind(this),
            error: function(resposta){
                if(resposta.status === 400){
                    new TratadorErros().publicaErros(resposta.responseJSON);
                }
            },
            beforeSend: function(){
                PubSub.publish("limpa-erros", {});
            }
        });
        this.setState({titulo: '', preco: '', autorId: ''});
    }

    setTitulo(evento){
        this.setState({titulo: evento.target.value});
    }

    setPreco(evento){
        this.setState({preco: evento.target.value});
    }

    setAutorId(evento){
        this.setState({autorId: evento.target.value});
    }

    render(){
        return (
            <div className="pure-form pure-form-aligned">
                <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm.bind(this)} method="post">
                  <InputCustomizado id="titulo" type="text" name="titulo" value={this.state.titulo} onChange={this.setTitulo.bind(this)} label="Título" />
                  <InputCustomizado id="preco" type="text" name="preco" value={this.state.preco} onChange={this.setPreco.bind(this)} label="Preço" />
                  <div className="pure-control-group">
                    <label htmlFor="autorId">Autor</label> 
                      <select value={this.state.autorId} name="autorId" id="autorId" onChange={this.setAutorId.bind(this)}>
                        <option value="">Selecione autor</option>
                        {
                            this.props.autores.map(function(autor){
                                return <option key={autor.id} value={autor.id}>{autor.nome}</option>
                            })
                        }
                    </select>
                    <span className="error">{this.state.msgErro}</span>
                  </div>           
                  <div className="pure-control-group">                                  
                    <label></label> 
                    <button type="submit" className="pure-button pure-button-primary">Gravar</button>                                    
                  </div>
                </form>             

              </div>  
        );
    }
}

class ListaLivros extends Component {

    render(){
        return (
            <div>           
                <table className="pure-table">
                  <thead>
                    <tr>
                      <th>Título</th>
                      <th>Preço</th>
                      <th>Autor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      this.props.lista.map(function(livro){
                        return (
                          <tr key={livro.id}>
                            <td>{livro.titulo}</td>
                            <td>{livro.preco}</td>
                            <td>{livro.autor.nome}</td>
                          </tr>
                        );
                      })
                    }
                  </tbody>
                </table> 
              </div>           
        );
    }
}

export default class LivroBox extends Component {
    
    constructor(){
        super();
        this.state = {lista: [], autores: []};
    }

    componentDidMount(){
        $.ajax({
            url: "http://localhost:8080/api/livros",
            dataType: "json",
            success: function(resposta){
                this.setState({lista: resposta});
            }.bind(this)
        });
        //PubSub.subscribe('atualiza-lista-autores', function(topico, resposta){ this.setState({lista: resposta}); }.bind(this));
        $.ajax({
            url: "http://localhost:8080/api/autores",
            dataType: "json",
            success: function(resposta){
                this.setState({autores: resposta});
            }.bind(this)
        });
    }

    atualizaListagem(novaLista){
        this.setState({lista: novaLista});
    }
    
    render(){
        return (
            <div>
                <div className="header">
                    <h1>Cadastro de livros</h1>
                </div>
                <div className="content" id="content">
                    <FormularioLivro autores={this.state.autores} callbackAtualizaListagem={this.atualizaListagem.bind(this)}/>
                    <ListaLivros lista={this.state.lista}/> 
                </div>
            </div>
        );
    }
}

