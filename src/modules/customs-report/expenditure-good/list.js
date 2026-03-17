import { inject } from 'aurelia-framework';
import { Service } from "./service";
import { Router } from 'aurelia-router';
import moment from 'moment';

@inject(Router, Service)
export class List {
    constructor(router, service) {
        this.service = service;
        this.router = router;
    }

    info = { page: 1, size: 50 };

    controlOptions = {
        label: {
            length: 4
        },
        control: {
            length: 4
        }
    };


    search() {
        this.error = {};

        if (!this.dateTo || this.dateTo == "Invalid Date")
            this.error.dateTo = "Tanggal Akhir harus diisi";

        if (!this.dateFrom || this.dateFrom == "Invalid Date")
            this.error.dateFrom = "Tanggal Awal harus diisi";


        if (Object.getOwnPropertyNames(this.error).length === 0) {
            this.flag = true;
            this.info.page = 1;
            this.info.total = 0;
            this.searching();
        }
    }

    searching() {

        var args = {
            page: this.info.page,
            size: this.info.size,
            dateFrom: this.dateFrom ? moment(this.dateFrom).format("YYYY-MM-DD") : "",
            dateTo: this.dateTo ? moment(this.dateTo).format("YYYY-MM-DD") : ""
        }
        this.service.search(args)

            .then(result => {
                this.rowCount = [];
                var rowDoc = [];
                this.info.total = result.info.total;
                var index = 0;
                this.totalqty = 0;
                this.totalprice = 0;
                this.data = [];
                var prices =[];
                for (var i of result.data) {
                    this.totalqty += i.qty;
                    // this.totalprice += i.price;

                    var price = i.pebNo.toString() + i.price.toString();

                    var existPrice = prices.find(x => x === price);
                    if(!existPrice){
                        prices.push(price);
                        this.totalprice += i.price;
                    }

                    i.price = i.price.toLocaleString('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    i.qty = i.qty.toLocaleString('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    i.pebDate= i.pebDate ?  moment(i.pebDate).format("DD MMM YYYY") : "-";
                    this.data.push(i);

                    //Span
                    var peb = i.pebNo.toString();
                    if (!this.rowCount[peb]) {
                        this.rowCount[peb] = 1;
                    } else {
                        this.rowCount[peb]++;
                    }
                }

                for (var b of result.data) {
                    let pebspan = result.data.find(o => o.pebNo == b.pebNo);
                    if (pebspan) {
                        pebspan.rowspan = this.rowCount[b.pebNo]
                    }
                   
                }
            });


    }

    changePage(e) {
        var page = e.detail;
        this.info.page = page;
        this.searching();
    }
    reset() {
        this.dateFrom = "";
        this.dateTo = "";
        this.data = [];
        this.info.page = 1;
    }

    ExportToExcel() {
        this.error = {};

        if (!this.dateTo || this.dateTo == "Invalid Date")
            this.error.dateTo = "Tanggal Akhir harus diisi";

        if (!this.dateFrom || this.dateFrom == "Invalid Date")
            this.error.dateFrom = "Tanggal Awal harus diisi";


        if (Object.getOwnPropertyNames(this.error).length === 0) {
            var info = {
                dateFrom: this.dateFrom ? moment(this.dateFrom).format("YYYY-MM-DD") : "",
                dateTo: this.dateTo ? moment(this.dateTo).format("YYYY-MM-DD") : ""
            }
            this.service.generateExcel(info);
        }
    }
}