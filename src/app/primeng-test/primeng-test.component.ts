import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ProductService } from './productservice';
import { Product } from './product';

@Component({
    selector: 'app-primeng-test',
    imports: [ButtonModule, TableModule],
    templateUrl: './primeng-test.component.html',
    styleUrl: './primeng-test.component.css',
    providers: [ProductService]
})
export class PrimengTestComponent implements OnInit {
    products!: Product[];

    constructor(private productService: ProductService) { }

    ngOnInit() {
        this.productService.getProducts().then((data) => {
            this.products = data;
        });
    }
}
